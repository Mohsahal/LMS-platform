import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { scheduleLiveSessionService, listProgramSessionsInstructorService, fetchInstructorCourseListService, deleteLiveSessionService, getSessionAttendanceService } from "@/services";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

function InstructorLiveSessionsPage() {
  const { auth } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [programId, setProgramId] = useState("");
  const [topic, setTopic] = useState("");
  const [startTime, setStartTime] = useState("");
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const upcomingSessions = useMemo(() => {
    return (sessions || []).slice().sort((a,b) => new Date(a.startTime) - new Date(b.startTime));
  }, [sessions]);

  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [attendanceFor, setAttendanceFor] = useState(null);

  function exportAttendanceCsv() {
    if (!attendanceRows || attendanceRows.length === 0) return;
    const header = ["Name", "Email", "Joined At", "Left At", "Student ID"];
    const lines = attendanceRows.map(a => [
      JSON.stringify(a.studentName || ""),
      JSON.stringify(a.studentEmail || ""),
      JSON.stringify(a.joinedAt ? new Date(a.joinedAt).toLocaleString() : ""),
      JSON.stringify(a.leftAt ? new Date(a.leftAt).toLocaleString() : ""),
      JSON.stringify(a.studentId || ""),
    ].join(","));
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${attendanceFor?.topic || "session"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCreate() {
    if (!programId) {
      toast({ title: "Select a course", description: "Please choose a course to attach this session." });
      return;
    }
    if (!topic || !startTime) {
      toast({ title: "Missing details", description: "Add a topic and date/time." });
      return;
    }
    try {
      const res = await scheduleLiveSessionService({
        courseId: programId,
        instructorId: auth?.user?._id,
        instructorName: auth?.user?.userName,
        topic,
        startTime: new Date(startTime),
      });
      if (res?.success) {
        toast({ title: "Session scheduled", description: "A join link was generated automatically." });
        setTopic("");
        setStartTime("");
        fetchSessions();
      } else {
        toast({ title: "Failed to schedule", description: res?.message || "Please try again.", variant: "destructive" });
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Request failed";
      toast({ title: "Failed to schedule", description: msg, variant: "destructive" });
    }
  }

  async function fetchSessions() {
    if (!programId) { setSessions([]); return; }
    const res = await listProgramSessionsInstructorService(programId);
    if (res?.success) setSessions(res.data || []);
  }

  useEffect(() => {
    fetchSessions();
    // fetch instructor courses to populate selector
    (async () => {
      const res = await fetchInstructorCourseListService();
      if (res?.success) setCourses(res.data || []);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programId]);

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-5xl mx-auto grid gap-6 lg:grid-cols-2">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Schedule Live Session</h2>
            <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
          </div>
          <div className="grid gap-3">
            <label className="text-sm font-medium text-gray-700">Course</label>
            <select className="border p-2 rounded" value={programId} onChange={(e) => setProgramId(e.target.value)}>
              <option value="">Select a course</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>
            <label className="text-sm font-medium text-gray-700 mt-2">Topic</label>
            <input className="border p-2 rounded" placeholder="e.g. Orientation / Sprint Planning" value={topic} onChange={(e) => setTopic(e.target.value)} />
            <label className="text-sm font-medium text-gray-700 mt-2">Date & Time</label>
            <input className="border p-2 rounded" type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            <div className="pt-2">
              <Button onClick={handleCreate} disabled={!programId || !topic || !startTime} className="w-full">Create Session</Button>
            </div>
            <p className="text-xs text-gray-500">A Jitsi meeting link will be generated automatically.</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Upcoming Sessions</h3>
          {!programId && (
            <p className="text-sm text-gray-600">Choose a course to view and schedule sessions.</p>
          )}
          {programId && upcomingSessions.length === 0 && (
            <p className="text-sm text-gray-600">No sessions yet for this course.</p>
          )}
          <div className="space-y-3">
            {programId && upcomingSessions.map((s) => (
              <div key={s._id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{s.topic}</p>
                    <p className="text-xs text-gray-600">{new Date(s.startTime).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.meetingLink && (
                      <>
                        <a className="text-blue-600 text-sm underline" href={s.meetingLink} target="_blank" rel="noreferrer">Open</a>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(s.meetingLink)}
                          className="text-xs text-gray-700 border px-2 py-1 rounded hover:bg-gray-50"
                        >Copy</button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        const ok = confirm('Delete this session?');
                        if (!ok) return;
                        try {
                          const res = await deleteLiveSessionService(s._id, auth?.user?._id);
                          if (res?.success) {
                            toast({ title: 'Deleted', description: 'Session removed' });
                            fetchSessions();
                          } else {
                            toast({ title: 'Delete failed', description: res?.message || 'Try again', variant: 'destructive' });
                          }
                        } catch (e) {
                          const msg = e?.response?.data?.message || e?.message || 'Request failed';
                          toast({ title: 'Delete failed', description: msg, variant: 'destructive' });
                        }
                      }}
                      className="text-xs text-red-600 border border-red-300 px-2 py-1 rounded hover:bg-red-50"
                    >Delete</button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await getSessionAttendanceService(s._id);
                          if (res?.success) {
                            setAttendanceRows(res.data || []);
                            setAttendanceFor(s);
                            setAttendanceOpen(true);
                          } else {
                            toast({ title: 'Failed to load attendance', description: res?.message || 'Try again', variant: 'destructive' });
                          }
                        } catch (e) {
                          const msg = e?.response?.data?.message || e?.message || 'Request failed';
                          toast({ title: 'Failed to load attendance', description: msg, variant: 'destructive' });
                        }
                      }}
                      className="text-xs text-gray-700 border px-2 py-1 rounded hover:bg-gray-50"
                    >View Attendance</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={attendanceOpen} onOpenChange={setAttendanceOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Attendance {attendanceFor ? `— ${attendanceFor.topic}` : ""}</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-auto border rounded">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2">Name</th>
                  <th className="text-left px-3 py-2">Email</th>
                  <th className="text-left px-3 py-2">Joined</th>
                  <th className="text-left px-3 py-2">Left</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRows && attendanceRows.length > 0 ? attendanceRows.map((a, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2">{a.studentName || a.studentId || "-"}</td>
                    <td className="px-3 py-2">{a.studentEmail || "-"}</td>
                    <td className="px-3 py-2">{a.joinedAt ? new Date(a.joinedAt).toLocaleString() : "-"}</td>
                    <td className="px-3 py-2">{a.leftAt ? new Date(a.leftAt).toLocaleString() : "-"}</td>
                  </tr>
                )) : (
                  <tr>
                    <td className="px-3 py-6 text-center text-gray-600" colSpan={4}>No attendees yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAttendanceOpen(false)}>Close</Button>
            <Button onClick={exportAttendanceCsv} disabled={!attendanceRows || attendanceRows.length === 0}>Export CSV</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InstructorLiveSessionsPage;


