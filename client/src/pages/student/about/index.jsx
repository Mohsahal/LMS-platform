function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="px-4 lg:px-8 py-10 border-b bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">About BRAVYNEX ENGINEERING</h1>
          <p className="mt-3 text-gray-600 text-lg">Cultivating success together</p>
        </div>
      </section>

      <section className="px-4 lg:px-8 py-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-3">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              We help learners build job‑ready skills through practical courses led by industry experts. Our platform
              focuses on hands‑on projects, clear learning paths and a supportive community so you can grow from
              fundamentals to production‑ready expertise.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-3">What We Offer</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Curated courses in programming, backend, data science and more</li>
              <li>Real projects, capstones and progress tracking</li>
              <li>Responsive UI with a great learning experience across devices</li>
              <li>Secure payments and a clean student/instructor workflow</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-3">Our Values</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold">Clarity</h3>
                <p className="text-sm text-gray-600 mt-1">Clear content and paths to reduce confusion.</p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold">Practice</h3>
                <p className="text-sm text-gray-600 mt-1">Build by doing with hands‑on projects.</p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold">Community</h3>
                <p className="text-sm text-gray-600 mt-1">Learn together and support each other.</p>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border p-5">
              <h3 className="font-semibold">Contact</h3>
              <p className="text-sm text-gray-600 mt-2">Reach us at</p>
              <a className="text-sm text-blue-600" href="mailto:support@bravynex.com">support@bravynex.com</a>
            </div>
            <div className="rounded-xl border p-5">
              <h3 className="font-semibold">Follow</h3>
              <ul className="text-sm text-gray-700 mt-2 space-y-1">
                <li><a className="hover:underline" href="#">Twitter</a></li>
                <li><a className="hover:underline" href="#">LinkedIn</a></li>
                <li><a className="hover:underline" href="#">GitHub</a></li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;


