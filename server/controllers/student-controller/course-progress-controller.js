const CourseProgress = require("../../models/CourseProgress");
const Course = require("../../models/Course");
const StudentCourses = require("../../models/StudentCourses");
const User = require("../../models/User");
const PDFDocument = require("pdfkit");
const axios = require("axios");
const { randomBytes } = require("crypto");
const path = require("path");
const fs = require("fs");
const QRCode = require("qrcode");


//mark current lecture as viewed
const markCurrentLectureAsViewed = async (req, res) => {
  try {
    const { userId, courseId, lectureId } = req.body;

    let progress = await CourseProgress.findOne({ userId, courseId });
    const isFirstTimeWatching = !progress;
    
    if (!progress) {
      progress = new CourseProgress({
        userId,
        courseId,
        lecturesProgress: [
          {
            lectureId,
            viewed: true,
            dateViewed: new Date(),
          },
        ],
      });
      await progress.save();
      

    } else {
      const lectureProgress = progress.lecturesProgress.find(
        (item) => item.lectureId === lectureId
      );

      if (lectureProgress) {
        lectureProgress.viewed = true;
        lectureProgress.dateViewed = new Date();
      } else {
        progress.lecturesProgress.push({
          lectureId,
          viewed: true,
          dateViewed: new Date(),
        });
      }
      await progress.save();
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    //check all the lectures are viewed or not
    const allLecturesViewed =
      progress.lecturesProgress.length === course.curriculum.length &&
      progress.lecturesProgress.every((item) => item.viewed);

    if (allLecturesViewed && !progress.completed) {
      progress.completed = true;
      progress.completionDate = new Date();

      await progress.save();


    }



    res.status(200).json({
      success: true,
      message: "Lecture marked as viewed",
      data: progress,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

//get current course progress
const getCurrentCourseProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    const studentPurchasedCourses = await StudentCourses.findOne({ userId });

    const isCurrentCoursePurchasedByCurrentUserOrNot =
      studentPurchasedCourses?.courses?.findIndex(
        (item) => item.courseId === courseId
      ) > -1;

    if (!isCurrentCoursePurchasedByCurrentUserOrNot) {
      return res.status(200).json({
        success: true,
        data: {
          isPurchased: false,
        },
        message: "You need to purchase this course to access it.",
      });
    }

    const currentUserCourseProgress = await CourseProgress.findOne({
      userId,
      courseId,
    });

    if (
      !currentUserCourseProgress ||
      currentUserCourseProgress?.lecturesProgress?.length === 0
    ) {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "No progress found, you can start watching the course",
        data: {
          courseDetails: course,
          progress: [],
          isPurchased: true,
        },
      });
    }

    const courseDetails = await Course.findById(courseId);

    res.status(200).json({
      success: true,
      data: {
        courseDetails,
        progress: currentUserCourseProgress.lecturesProgress,
        completed: currentUserCourseProgress.completed,
        completionDate: currentUserCourseProgress.completionDate,
        isPurchased: true,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

//reset course progress

const resetCurrentCourseProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    const progress = await CourseProgress.findOne({ userId, courseId });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found!",
      });
    }

    progress.lecturesProgress = [];
    progress.completed = false;
    progress.completionDate = null;

    await progress.save();

    res.status(200).json({
      success: true,
      message: "Course progress has been reset",
      data: progress,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

// generate and stream certificate PDF for completed courses
const generateCompletionCertificate = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    const progress = await CourseProgress.findOne({ userId, courseId });
    if (!progress || !progress.completed) {
      return res.status(400).json({
        success: false,
        message: "Certificate available only after course completion",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const certificateId = randomBytes(8).toString("hex").toUpperCase();
    const issuedOn = new Date(progress.completionDate || Date.now()).toDateString();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=certificate_${(user.userName || "student").replace(/\s+/g, "_")}_${(course.title || "course").replace(/\s+/g, "_")}.pdf`
    );

    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0 });
    doc.pipe(res);

    // background (optional - URL from course settings or local file)
    if (course.certificateTemplateUrl) {
      try {
        const resp = await axios.get(course.certificateTemplateUrl, { responseType: "arraybuffer" });
        const imgBuffer = Buffer.from(resp.data, "binary");
        doc.image(imgBuffer, 0, 0, { width: doc.page.width, height: doc.page.height });
      } catch (_) {
        // ignore if failed to fetch
      }
    } else {
      // Try multiple local filenames for convenience
      const uploadsDir = path.join(__dirname, "../../uploads");
      const candidates = [
        path.join(uploadsDir, "certificate_bg.png"),
        path.join(uploadsDir, "Certificate_v002.png"),
      ];
      let appliedBackground = false;
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          try {
            doc.image(p, 0, 0, { width: doc.page.width, height: doc.page.height });
            appliedBackground = true;
            break;
          } catch (_) {}
        }
      }
      // As a last resort, pick any .png in uploads
      if (!appliedBackground) {
        try {
          const files = fs.readdirSync(uploadsDir).filter((f) => f.toLowerCase().endsWith(".png"));
          if (files.length > 0) {
            const firstPng = path.join(uploadsDir, files[0]);
            doc.image(firstPng, 0, 0, { width: doc.page.width, height: doc.page.height });
          }
        } catch (_) {}
      }
    }

    // Overlay text at fixed coordinates to match template
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const centerX = pageWidth / 2;

    // Ms./Mr. [Name] .......... Student ID [id]
    const displayName = `${user.userName || user.userEmail}`;
    // Guardian name support (renamed from guardianDetails)
    const guardianValue = user.guardianName || user.guardianDetails
    const guardianLine = guardianValue ? `${guardianValue}` : "";
    doc.fontSize(14).fillColor("#3b0764");
    // Name on left underline after Ms./Mr.
    doc.text(`${displayName}`, 170, 258, { width: 260, align: "left" });
    // Guardian details (son/daughter/ward of)
    if (guardianLine) {
      doc.text(`${guardianLine}`, 400, 258, { width: 240, align: "left" });
    }
    // Student ID
    // doc.text(`${userId}`, 605, 256, { width: 175, align: "left" });
    doc.text(`${userId}`, 605, 256, { width: 190, align: "left" });

    // has successfully completed the [Course]  Course
    const courseNameToPrint = course.certificateCourseName || course.title;
    // Only the course name goes in the blank between 'completed the' and 'Course'
    doc.fillColor("#3b0764").fontSize(14);
    doc.text(`${courseNameToPrint}`, 430, 284, { width: 240, align: "left" });

    // with Grade ___ from ___
    const printedFrom = course.certificateFrom || "BRAVYNEX ENGINEERING";
    const printedGrade = course.defaultCertificateGrade || "A";
    // Grade blank
    doc.text(`${printedGrade}`, 320, 307, { width: 60, align: "left" });
    // From blank
    doc.text(`${printedFrom}`, 400, 306, { width: 320, align: "left" });

    // Certificate ID value on the line
    doc.fillColor("#3b0764").fontSize(14);
    doc.text(`${certificateId}`, 250, 375, { width: 360, align: "left" });

    // Date of Issuance value on its line
    doc.text(`${issuedOn}`, 240, 425, { width: 220, align: "left" });

    // Generate and place QR code that links to student dashboard
    try {
      // Build a dashboard URL; prefer FRONTEND_URL env, else infer from request
      const frontendBase = process.env.CLIENT_URL || `${req.protocol}://${req.get("host")}`.replace(/\/$/, "");
      // Adjust path to your student dashboard route
      const dashboardPath = "/student/home"; // update if different
      const qrTargetUrl = `${frontendBase}${dashboardPath}`;

      const qrDataUrl = await QRCode.toDataURL(qrTargetUrl, {
        errorCorrectionLevel: "H",
        margin: 1,
        scale: 6,
      });
      const qrBase64 = qrDataUrl.split(",")[1];
      const qrBuffer = Buffer.from(qrBase64, "base64");

      // Position QR at bottom-right; adjust size/coords to fit template
      const qrSize = 90; // pixels
      const qrX = doc.page.width - qrSize - 570;
      const qrY = doc.page.height - qrSize - 60;
      doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

      // Optional label under QR
      // doc.fillColor("#3b0764").fontSize(10).text("Scan for Student Dashboard", qrX - 10, qrY + qrSize + 5, { width: qrSize + 20, align: "center" });
    } catch (_) {
      // If QR generation fails, continue without blocking certificate
    }

    // Issuer/signature area (right side)
    // Do not reprint issuer/organization if your template already contains them

    // Signature block
    // doc.fillColor("#6b21a8").fontSize(14).text(course.certificateIssuer || "Chief Executive Officer", pageWidth - 330, 520, { width: 300, align: "right" });
    // doc.fillColor("#6b21a8").fontSize(14).text(course.certificateOrganization || "BRAVYNEX ENGINEERING", pageWidth - 330, 545, { width: 300, align: "right" });

    doc.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to generate certificate" });
  }
};

module.exports = {
  markCurrentLectureAsViewed,
  getCurrentCourseProgress,
  resetCurrentCourseProgress,
  generateCompletionCertificate,
};
