const LiveSession = require("../../models/LiveSession");
const Course = require("../../models/Course");
const User = require("../../models/User");
const { randomUUID } = require("node:crypto");

// Jitsi removed; Google Meet is the only provider now

const scheduleSession = async (req, res) => {
  try {
    const {
      internshipProgramId,
      courseId, // preferred
      instructorId,
      instructorName,
      topic,
      description,
      startTime,
      durationMinutes = 60,
      meetingProvider = "google",
    } = req.body;

    if (!instructorId || !topic || !startTime || !(courseId || internshipProgramId)) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // validate time is in future
    const start = new Date(startTime);
    if (isNaN(start.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid startTime" });
    }
    if (start.getTime() < Date.now() - 60 * 1000) {
      return res.status(400).json({ success: false, message: "startTime must be in the future" });
    }

    // validate course exists and owned by instructor
    const courseRefId = courseId || internshipProgramId;
    const course = await Course.findById(courseRefId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    if (course.instructorId && course.instructorId !== instructorId) {
      return res.status(403).json({ success: false, message: "You are not the instructor of this course" });
    }

    let meetingLink = "";
    let moderatorLink = "";
    if (meetingProvider === "google") {
      // Use Google Calendar API to create an event with Meet link
      const instructor = await User.findById(instructorId);
      if (!instructor?.google?.connected || !instructor.google.refresh_token) {
        return res.status(400).json({ success: false, message: "Google not connected for instructor" });
      }
      try {
        const { google } = require("googleapis");
        const oauth2Client = new (google.auth.OAuth2)(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          process.env.GOOGLE_REDIRECT_URI
        );
        oauth2Client.setCredentials({
          access_token: instructor.google.access_token,
          refresh_token: instructor.google.refresh_token,
          scope: instructor.google.scope,
          token_type: instructor.google.token_type,
          expiry_date: instructor.google.expiry_date,
        });

        // refresh token if needed
        if (instructor.google.expiry_date && instructor.google.expiry_date < Date.now()) {
          const { credentials } = await oauth2Client.refreshAccessToken();
          instructor.google = { connected: true, ...credentials };
          await instructor.save();
          oauth2Client.setCredentials(credentials);
        }

        const calendar = google.calendar({ version: "v3", auth: oauth2Client });
        const end = new Date(start.getTime() + durationMinutes * 60000);
        const event = await calendar.events.insert({
          calendarId: "primary",
          requestBody: {
            summary: topic,
            description: description || `Course ${course.title}`,
            start: { dateTime: start.toISOString() },
            end: { dateTime: end.toISOString() },
            conferenceData: {
              createRequest: { requestId: `${Date.now()}-${Math.random()}` },
            },
          },
          conferenceDataVersion: 1,
        });
        const hangoutLink = event?.data?.hangoutLink;
        meetingLink = hangoutLink || "";
        moderatorLink = hangoutLink || "";
      } catch (err) {
        console.error("Google create event error", err?.response?.data || err);
        return res.status(500).json({ success: false, message: "Failed to create Google Meet event" });
      }
    } else {
      return res.status(400).json({ success: false, message: "Unsupported meeting provider" });
    }

    const session = await LiveSession.create({
      internshipProgramId: courseRefId,
      instructorId,
      instructorName: instructorName || course.instructorName,
      topic,
      description,
      startTime: start,
      durationMinutes,
      meetingProvider,
      meetingLink,
      moderatorLink,
    });

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    console.error("scheduleSession error", error);
    res.status(500).json({ success: false, message: "Failed to schedule session" });
  }
};

const addRecording = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { recordingUrl } = req.body;
    const session = await LiveSession.findByIdAndUpdate(
      sessionId,
      { recordingUrl },
      { new: true }
    );
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    console.error("addRecording error", error);
    res.status(500).json({ success: false, message: "Failed to add recording" });
  }
};

const addResource = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title, url } = req.body;
    const session = await LiveSession.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    session.resources.push({ title, url });
    await session.save();
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    console.error("addResource error", error);
    res.status(500).json({ success: false, message: "Failed to add resource" });
  }
};

const listSessionsForProgram = async (req, res) => {
  try {
    const { programId } = req.params;
    const sessions = await LiveSession.find({ internshipProgramId: programId }).sort({ startTime: 1 });
    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    console.error("listSessionsForProgram error", error);
    res.status(500).json({ success: false, message: "Failed to list sessions" });
  }
};

const getAttendance = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await LiveSession.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    const rows = Array.isArray(session.attendance) ? session.attendance : [];
    const seen = new Set();
    const unique = [];
    for (const entry of rows) {
      const key = entry?.studentId || entry?._id?.toString();
      if (!key) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(entry);
    }
    res.status(200).json({ success: true, data: unique });
  } catch (error) {
    console.error("getAttendance error", error);
    res.status(500).json({ success: false, message: "Failed to fetch attendance" });
  }
};

const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { instructorId } = req.query; // optional guard
    const session = await LiveSession.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    if (instructorId && session.instructorId !== instructorId) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }
    await LiveSession.findByIdAndDelete(sessionId);
    res.status(200).json({ success: true, message: "Session deleted" });
  } catch (error) {
    console.error("deleteSession error", error);
    res.status(500).json({ success: false, message: "Failed to delete session" });
  }
};

// Allow instructor to update meeting link manually (e.g., after creating ad-hoc Meet)
const setMeetingLink = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { meetingLink } = req.body;
    if (!meetingLink || typeof meetingLink !== "string") {
      return res.status(400).json({ success: false, message: "Invalid meeting link" });
    }
    const session = await LiveSession.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    session.meetingLink = meetingLink;
    session.moderatorLink = meetingLink;
    await session.save();
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    console.error("setMeetingLink error", error);
    res.status(500).json({ success: false, message: "Failed to set meeting link" });
  }
};

module.exports = {
  scheduleSession,
  addRecording,
  addResource,
  listSessionsForProgram,
  getAttendance,
  deleteSession,
  setMeetingLink,
};


