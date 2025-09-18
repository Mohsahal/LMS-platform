import { useState } from "react";
import { Link } from "react-router-dom";
import { contactAdminService } from "@/services";
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin } from "lucide-react";

function Footer() {
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
    <footer className="mt-12 border-t bg-gray-50 dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h3 className="font-extrabold text-xl text-gray-900 dark:text-white">BRAVYNEX ENGINEERING</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Cultivating success together.</p>
          <div className="flex items-center gap-3 mt-4 text-gray-600 dark:text-gray-300">
            <MapPin className="h-4 w-4" />
            <span>Global • Remote-first</span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-gray-600 dark:text-gray-300">
            <Phone className="h-4 w-4" />
            <a href="tel:+1000000000" className="hover:underline">+1 (000) 000-0000</a>
          </div>
          <div className="flex items-center gap-3 mt-2 text-gray-600 dark:text-gray-300">
            <Mail className="h-4 w-4" />
            <a href="mailto:support@bravynex.com" className="hover:underline">support@bravynex.com</a>
          </div>
          <div className="flex items-center gap-4 mt-4 text-gray-600 dark:text-gray-300">
            <a className="hover:text-gray-900 dark:hover:text-white" href="#" aria-label="Twitter"><Twitter className="h-5 w-5" /></a>
            <a className="hover:text-gray-900 dark:hover:text-white" href="#" aria-label="Facebook"><Facebook className="h-5 w-5" /></a>
            <a className="hover:text-gray-900 dark:hover:text-white" href="#" aria-label="Instagram"><Instagram className="h-5 w-5" /></a>
            <a className="hover:text-gray-900 dark:hover:text-white" href="#" aria-label="LinkedIn"><Linkedin className="h-5 w-5" /></a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Explore</h4>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li><Link to="/home" className="hover:underline">Home</Link></li>
            <li><Link to="/courses" className="hover:underline">Courses</Link></li>
            <li><Link to="/student-courses" className="hover:underline">My Courses</Link></li>
            <li><Link to="/about" className="hover:underline">About</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Resources</h4>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li><a className="hover:underline" href="#">Blog</a></li>
            <li><a className="hover:underline" href="#">Help Center</a></li>
            <li><a className="hover:underline" href="#">Terms of Service</a></li>
            <li><a className="hover:underline" href="#">Privacy Policy</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Contact Us</h4>
          <form onSubmit={handleContactSubmit} className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Your name"
              className="rounded border px-3 py-2 text-sm bg-white dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-100"
              value={contactForm.fromName}
              onChange={(e)=>setContactForm({ ...contactForm, fromName: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Your email"
              className="rounded border px-3 py-2 text-sm bg-white dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-100"
              value={contactForm.fromEmail}
              onChange={(e)=>setContactForm({ ...contactForm, fromEmail: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Subject (optional)"
              className="rounded border px-3 py-2 text-sm bg-white dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-100"
              value={contactForm.subject}
              onChange={(e)=>setContactForm({ ...contactForm, subject: e.target.value })}
            />
            <textarea
              placeholder="Message"
              rows={3}
              className="rounded border px-3 py-2 text-sm bg-white dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-100"
              value={contactForm.message}
              onChange={(e)=>setContactForm({ ...contactForm, message: e.target.value })}
              required
            />
            <button disabled={sending} className="inline-flex h-9 items-center justify-center rounded-md bg-black px-4 text-white text-sm hover:bg-black/90 disabled:opacity-50" type="submit">
              {sending ? "Sending..." : "Send"}
            </button>
            {statusMsg ? <p className="text-xs text-gray-600 dark:text-gray-300">{statusMsg}</p> : null}
          </form>
        </div>
      </div>
      <div className="text-center text-xs text-gray-500 dark:text-gray-400 py-5">© {new Date().getFullYear()} Bravynex Engineering. All rights reserved.</div>
    </footer>
  );
}

export default Footer;


