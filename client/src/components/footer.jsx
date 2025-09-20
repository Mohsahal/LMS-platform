import { useState } from "react";
import { Link } from "react-router-dom";
import { contactAdminService } from "@/services";
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin } from "lucide-react";

function Footer() {
  const [contactForm, setContactForm] = useState({ 
    fromName: "", 
    fromEmail: "", 
    phoneNumber: "",
    course: "",
    segment: "",
    institution: "",
    message: "" 
  });
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  async function handleContactSubmit(e) {
    e.preventDefault();
    setStatusMsg("");
    setSending(true);
    try {
      // Ensure all fields are sent, even if empty
      const formData = {
        fromEmail: contactForm.fromEmail || '',
        fromName: contactForm.fromName || '',
        phoneNumber: contactForm.phoneNumber || '',
        course: contactForm.course || '',
        segment: contactForm.segment || '',
        institution: contactForm.institution || '',
        message: contactForm.message || '',
        subject: "Website contact form submission",
      };
      
      console.log("=== Form Data Being Sent ===");
      console.log("fromName:", formData.fromName, "| Type:", typeof formData.fromName);
      console.log("fromEmail:", formData.fromEmail, "| Type:", typeof formData.fromEmail);
      console.log("phoneNumber:", formData.phoneNumber, "| Type:", typeof formData.phoneNumber);
      console.log("course:", formData.course, "| Type:", typeof formData.course);
      console.log("segment:", formData.segment, "| Type:", typeof formData.segment);
      console.log("institution:", formData.institution, "| Type:", typeof formData.institution);
      console.log("message:", formData.message, "| Type:", typeof formData.message);
      console.log("===========================");
      
      // Also log the original contactForm state
      console.log("=== Original Contact Form State ===");
      console.log("contactForm:", contactForm);
      console.log("===================================");
      
      const res = await contactAdminService(formData);
      setStatusMsg(res?.success ? "Message sent successfully." : res?.message || "Failed to send.");
      if (res?.success) setContactForm({ 
        fromName: "", 
        fromEmail: "", 
        phoneNumber: "",
        course: "",
        segment: "",
        institution: "",
        message: "" 
      });
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
            <a href="tel:+18058011389" className="hover:underline">+1 (805) 801-1389</a>
          </div>
          <div className="flex items-center gap-3 mt-2 text-gray-600 dark:text-gray-300">
            <Mail className="h-4 w-4" />
            <a href="mailto:bravynex@gmail.com" className="hover:underline">bravynex@gmail.com</a>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <a className="text-blue-400 hover:text-blue-500 transition-colors duration-200" href="#" aria-label="Twitter"><Twitter className="h-5 w-5" /></a>
            <a className="text-blue-600 hover:text-blue-700 transition-colors duration-200" href="#" aria-label="Facebook"><Facebook className="h-5 w-5" /></a>
            <a className="text-pink-500 hover:text-pink-600 transition-colors duration-200" href="#" aria-label="Instagram"><Instagram className="h-5 w-5" /></a>
            <a className="text-blue-700 hover:text-blue-800 transition-colors duration-200" href="#" aria-label="LinkedIn"><Linkedin className="h-5 w-5" /></a>
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
          <form onSubmit={handleContactSubmit} className="flex flex-col gap-3">
            {/* Row 1: Name and Course */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Name"
                className="rounded border px-3 py-2 text-sm bg-white dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-100"
                value={contactForm.fromName}
                onChange={(e)=>setContactForm({ ...contactForm, fromName: e.target.value })}
                required
              />
              <select
                className="rounded border px-3 py-2 text-sm bg-white dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-100"
                value={contactForm.course}
                onChange={(e)=>setContactForm({ ...contactForm, course: e.target.value })}
              >
                <option value="">Select Course</option>
                <option value="Introduction to Python">Introduction to Python</option>
                <option value="Web Development">Web Development</option>
                <option value="Data Science">Data Science</option>
                <option value="Machine Learning">Machine Learning</option>
                <option value="Mobile App Development">Mobile App Development</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            {/* Row 2: Email and Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="email"
                placeholder="Email"
                className="rounded border px-3 py-2 text-sm bg-white dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-100"
                value={contactForm.fromEmail}
                onChange={(e)=>setContactForm({ ...contactForm, fromEmail: e.target.value })}
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                className="rounded border px-3 py-2 text-sm bg-white dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-100"
                value={contactForm.phoneNumber}
                onChange={(e)=>setContactForm({ ...contactForm, phoneNumber: e.target.value })}
              />
            </div>
            
            {/* Row 3: Segment and Institution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                className="rounded border px-3 py-2 text-sm bg-white dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-100"
                value={contactForm.segment}
                onChange={(e)=>setContactForm({ ...contactForm, segment: e.target.value })}
              >
                <option value="">Select the segment</option>
                <option value="Student">Student</option>
                <option value="Professional">Professional</option>
                <option value="Educator">Educator</option>
                <option value="Corporate">Corporate</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="text"
                placeholder="Name of the Institution"
                className="rounded border px-3 py-2 text-sm bg-white dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-100"
                value={contactForm.institution}
                onChange={(e)=>setContactForm({ ...contactForm, institution: e.target.value })}
              />
            </div>
            
            {/* Message */}
            <textarea
              placeholder="Message"
              rows={3}
              className="rounded border px-3 py-2 text-sm bg-white dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-100"
              value={contactForm.message}
              onChange={(e)=>setContactForm({ ...contactForm, message: e.target.value })}
              required
            />
            
            <button disabled={sending} className="inline-flex h-10 items-center justify-center rounded-md bg-black px-6 text-white text-sm hover:bg-black/90 disabled:opacity-50 transition-colors duration-200" type="submit">
              {sending ? "Sending..." : "Submit →"}
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


