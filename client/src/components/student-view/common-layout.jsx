import { Outlet, useLocation } from "react-router-dom";
import StudentViewCommonHeader from "./header";
import { Link } from "react-router-dom";
import { useState } from "react";
import { contactAdminService } from "@/services";

function StudentViewCommonLayout() {
  const location = useLocation();
  const [contactForm, setContactForm] = useState({ fromName: "", fromEmail: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  async function handleContactSubmit(e) {
    e.preventDefault();
    setStatusMsg("");
    setSending(true);
    try {
      const res = await contactAdminService({
        fromEmail: contactForm.fromEmail,
        fromName: contactForm.fromName,
        subject: contactForm.subject || "Website contact",
        message: contactForm.message,
      });
      setStatusMsg(res?.success ? "Message sent successfully." : res?.message || "Failed to send.");
      if (res?.success) setContactForm({ fromName: "", fromEmail: "", subject: "", message: "" });
    } catch (err) {
      setStatusMsg(err?.message || "Failed to send.");
    } finally {
      setSending(false);
    }
  }
  return (
    <div>
      {!location.pathname.includes("course-progress") ? (
        <StudentViewCommonHeader />
      ) : null}

      <Outlet />

      {/* Footer / Contact Us */}
      {!location.pathname.includes("course-progress") ? (
        <footer className="mt-12 border-t bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-extrabold text-lg">BRAVYNEX ENGINEERING</h3>
              <p className="text-sm text-gray-600 mt-2">Cultivating success together.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Explore</h4>
              <ul className="space-y-1 text-sm">
                <li><Link to="/home" className="hover:underline">Home</Link></li>
                <li><Link to="/courses" className="hover:underline">Courses</Link></li>
                <li><Link to="/student-courses" className="hover:underline">My Courses</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Company</h4>
              <ul className="space-y-1 text-sm">
                <li><Link to="/about" className="hover:underline">About</Link></li>
                <li><a href="mailto:support@bravynex.com" className="hover:underline">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Contact Us</h4>
              <form onSubmit={handleContactSubmit} className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Your name"
                  className="rounded border px-3 py-2 text-sm"
                  value={contactForm.fromName}
                  onChange={(e)=>setContactForm({ ...contactForm, fromName: e.target.value })}
                  required
                />
                <input
                  type="email"
                  placeholder="Your email"
                  className="rounded border px-3 py-2 text-sm"
                  value={contactForm.fromEmail}
                  onChange={(e)=>setContactForm({ ...contactForm, fromEmail: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Subject (optional)"
                  className="rounded border px-3 py-2 text-sm"
                  value={contactForm.subject}
                  onChange={(e)=>setContactForm({ ...contactForm, subject: e.target.value })}
                />
                <textarea
                  placeholder="Message"
                  rows={3}
                  className="rounded border px-3 py-2 text-sm"
                  value={contactForm.message}
                  onChange={(e)=>setContactForm({ ...contactForm, message: e.target.value })}
                  required
                />
                <button disabled={sending} className="inline-flex h-9 items-center justify-center rounded-md bg-black px-4 text-white text-sm hover:bg-black/90 disabled:opacity-50" type="submit">
                  {sending ? "Sending..." : "Send"}
                </button>
                {statusMsg ? <p className="text-xs text-gray-600">{statusMsg}</p> : null}
              </form>
            </div>
          </div>
          <div className="text-center text-xs text-gray-500 py-4">© {new Date().getFullYear()} Bravynex Engineering. All rights reserved.</div>
        </footer>
      ) : null}
    </div>
  );
}

export default StudentViewCommonLayout;
