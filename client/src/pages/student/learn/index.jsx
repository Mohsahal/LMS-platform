import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fetchStudentViewCourseDetailsService, listProgramSessionsStudentService, downloadCertificateService, joinLiveSessionService, checkCertificateEligibilityService } from "@/services";
import { useAuth } from "@/context/auth-context";

function LearnPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [course, setCourse] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const res = await fetchStudentViewCourseDetailsService(id);
      if (res?.success) setCourse(res.data);
      const sess = await listProgramSessionsStudentService(id);
      if (sess?.success) setSessions(sess.data || []);
    }
    load();
  }, [id]);

  useEffect(() => {
    async function checkEligibility() {
      try {
        setEligibilityChecked(false);
        if (!id || !auth?.user?._id) return;
        const res = await checkCertificateEligibilityService(id, auth.user._id);
        if (res?.success) setEligible(Boolean(res.data));
      } finally {
        setEligibilityChecked(true);
      }
    }
    checkEligibility();
  }, [id, auth?.user?._id]);

  const tabs = useMemo(() => ([
    { key: "overview", label: "Overview" },
    { key: "live", label: "Live Sessions" },
    { key: "recorded", label: "Recorded Videos" },
    { key: "assignments", label: "Assignments" },
    { key: "certificate", label: "Certificate" },
  ]), []);

  async function handleDownloadCertificate() {
    try {
      setDownloading(true);
      const res = await downloadCertificateService(auth?.user?._id, id);
      if (res.status === 200) {
        const contentType = res.headers?.["content-type"] || "";
        const isPdf = contentType.includes("application/pdf");
        const blob = new Blob([res.data], { type: isPdf ? "application/pdf" : contentType || "application/octet-stream" });
        if (!isPdf) {
          const text = await blob.text();
          try {
            const data = JSON.parse(text);
            alert(data?.message || "Certificate not available yet.");
            return;
          } catch {
            alert("Certificate not available yet.");
            return;
          }
        }
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `certificate_${course?.title || "course"}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      }
    } finally {
      setDownloading(false);
    }
  }

  async function handleJoin(session) {
    try {
      const res = await joinLiveSessionService(session._id, {
        studentId: auth?.user?._id,
        studentName: auth?.user?.userName,
        studentEmail: auth?.user?.userEmail,
      });
      if (res?.success && res.meetingLink) {
        window.open(res.meetingLink, "_blank", "noopener,noreferrer");
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">{course?.title || "Course"}</h1>
            <p className="text-xs text-gray-600">Learn, attend live, and earn your certificate.</p>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
        </div>

        <div className="flex items-center gap-2 border-b mb-4 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`px-3 py-2 text-sm border-b-2 ${activeTab === t.key ? 'border-black text-black' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
            >{t.label}</button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold mb-2">About this course</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{course?.description || "No description provided."}</p>
          </div>
        )}

        {activeTab === "live" && (
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Upcoming Sessions</h3>
            </div>
            {sessions.length === 0 ? (
              <p className="text-sm text-gray-600">No sessions scheduled yet.</p>
            ) : (
              <div className="space-y-2">
                {sessions.map(s => (
                  <div key={s._id} className="p-3 border rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium">{s.topic}</p>
                      <p className="text-xs text-gray-600">{new Date(s.startTime).toLocaleString()}</p>
                    </div>
                    {s.meetingLink && (
                      <Button size="sm" onClick={() => handleJoin(s)}>Join</Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "recorded" && (
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Recorded Videos</h3>
              <Button onClick={() => navigate(`/course-progress/${id}`)}>Open Course Player</Button>
            </div>
            {Array.isArray(course?.curriculum) && course.curriculum.length > 0 ? (
              <ul className="grid sm:grid-cols-2 gap-2">
                {course.curriculum.map((lec, idx) => (
                  <li key={idx} className="text-sm text-gray-800 border rounded p-2 flex items-center justify-between">
                    <span className="truncate mr-3">{lec.title}</span>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/course-progress/${id}`)}>Watch</Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">No videos found.</p>
            )}
          </div>
        )}

        {activeTab === "assignments" && (
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold mb-2">Assignments</h3>
            <p className="text-sm text-gray-600">No assignments configured.</p>
          </div>
        )}

        {activeTab === "certificate" && (
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold mb-3">Certificate</h3>
            <p className="text-sm text-gray-700 mb-3">If enabled by your instructor and you have completed the course, you can download your certificate below.</p>
            <div className="flex items-center gap-3">
              <Button onClick={handleDownloadCertificate} disabled={!eligible || downloading}>
                {downloading ? 'Preparing...' : 'Download Certificate'}
              </Button>
              {!eligibilityChecked ? (
                <span className="text-xs text-gray-500">Checking eligibility…</span>
              ) : !eligible ? (
                <span className="text-xs text-gray-500">Your instructor/admin has not enabled your certificate yet.</span>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LearnPage;


