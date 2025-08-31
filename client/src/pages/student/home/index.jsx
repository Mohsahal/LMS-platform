import { courseCategories } from "@/config";
// removed static banner in favor of dynamic hero images
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useContext, useEffect } from "react";
import { StudentContext } from "@/context/student-context";
import {
  checkCoursePurchaseInfoService,
  fetchStudentViewCourseListService,
} from "@/services";
import { AuthContext } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";

function StudentHomePage() {
  const { studentViewCoursesList, setStudentViewCoursesList } =
    useContext(StudentContext);
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  function handleNavigateToCoursesPage(getCurrentId) {
    console.log(getCurrentId);
    sessionStorage.removeItem("filters");
    const currentFilter = {
      category: [getCurrentId],
    };

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));

    navigate("/courses");
  }

  async function fetchAllStudentViewCourses() {
    const response = await fetchStudentViewCourseListService();
    if (response?.success) setStudentViewCoursesList(response?.data);
  }

  async function handleCourseNavigate(getCurrentCourseId) {
    const response = await checkCoursePurchaseInfoService(
      getCurrentCourseId,
      auth?.user?._id
    );

    if (response?.success) {
      if (response?.data) {
        navigate(`/course-progress/${getCurrentCourseId}`);
      } else {
        navigate(`/course/details/${getCurrentCourseId}`);
      }
    }
  }

  useEffect(() => {
    fetchAllStudentViewCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // High-quality hero images (royalty-free Unsplash)
  const heroImages = [
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=1920&auto=format&fit=crop",
  ];

  // Simple hero slider data (replace images/text as needed)
  const slides = [
    {
      id: 1,
      badge: "Most Popular",
      title: "Master Programming\nSkills",
      sub: "Build your coding expertise with hands-on projects and real-world applications.",
      image: heroImages[0],
      statLeft: { label: "50,000+ students" },
      statMid: { label: "4.8 rating" },
      statRight: { label: "Self-paced" },
    },
    {
      id: 2,
      badge: "Trending",
      title: "Learn Backend\nEngineering",
      sub: "APIs, databases and deployments. From fundamentals to production.",
      image: heroImages[1],
      statLeft: { label: "10+ projects" },
      statMid: { label: "Career-ready" },
      statRight: { label: "Mentor support" },
    },
    {
      id: 3,
      badge: "New",
      title: "Dive into Data\nScience",
      sub: "Statistics, Python and ML workflows with beautiful visualizations.",
      image: heroImages[2],
      statLeft: { label: "150+ lessons" },
      statMid: { label: "Hands-on" },
      statRight: { label: "Capstone" },
    },
  ];

  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef(null);

  function resetAutoplay() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
  }

  useEffect(() => {
    resetAutoplay();
    return () => timeoutRef.current && clearTimeout(timeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  function goTo(index) {
    setCurrent((index + slides.length) % slides.length);
  }

  function next() {
    goTo(current + 1);
  }

  function prev() {
    goTo(current - 1);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Slider */}
      <section className="px-4 lg:px-8 pt-6">
        <div className="relative bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center p-6 lg:p-10">
            {/* Left: Copy */}
            <div>
              <span className="inline-flex items-center text-sm px-3 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                {slides[current].badge}
              </span>
              <h1 className="mt-4 text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight whitespace-pre-line">
                {slides[current].title}
              </h1>
              <p className="mt-4 text-gray-600 text-lg max-w-xl">
                {slides[current].sub}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-700">
                <div className="flex items-center gap-2"><span>👥</span>{slides[current].statLeft.label}</div>
                <div className="flex items-center gap-2"><span>⭐</span>{slides[current].statMid.label}</div>
                <div className="flex items-center gap-2"><span>🕒</span>{slides[current].statRight.label}</div>
              </div>
              <div className="mt-8 flex gap-3">
                <Button onClick={() => navigate("/courses")}>Explore Programming</Button>
                <Button variant="outline">Watch Preview</Button>
              </div>
            </div>

            {/* Right: Visual (buttons are anchored to this container for perfect alignment) */}
            <div className="relative">
              <img
                key={slides[current].id}
                src={slides[current].image}
                alt="E-learning hero"
                loading="eager"
                className="w-full h-[320px] lg:h-[420px] object-cover rounded-xl transition-opacity duration-500"
              />
              {/* Controls inside the image container so both arrows align on the same vertical axis */}
              <button
                onClick={prev}
                aria-label="Previous slide"
                className="hidden lg:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                ‹
              </button>
              <button
                onClick={next}
                aria-label="Next slide"
                className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                ›
              </button>
            </div>
          </div>


          {/* Dots */}
          <div className="flex items-center justify-center gap-2 pb-5">
            {slides.map((s, i) => (
              <button
                key={`dot-${s.id}`}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all ${i === current ? "w-6 bg-blue-600" : "w-2 bg-gray-300"}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
      <section className="py-8 px-4 lg:px-8 bg-gray-100">
        <h2 className="text-2xl font-bold mb-6">Course Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {courseCategories.map((categoryItem) => (
            <Button
              className="justify-start"
              variant="outline"
              key={categoryItem.id}
              onClick={() => handleNavigateToCoursesPage(categoryItem.id)}
            >
              {categoryItem.label}
            </Button>
          ))}
        </div>
      </section>
      <section className="py-12 px-4 lg:px-8">
        <h2 className="text-2xl font-bold mb-6">Featured COourses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {studentViewCoursesList && studentViewCoursesList.length > 0 ? (
            studentViewCoursesList.map((courseItem) => (
              <div
                key={courseItem?._id}
                onClick={() => handleCourseNavigate(courseItem?._id)}
                className="border rounded-lg overflow-hidden shadow cursor-pointer"
              >
                <img
                  src={courseItem?.image}
                  width={300}
                  height={150}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold mb-2">{courseItem?.title}</h3>
                  <p className="text-sm text-gray-700 mb-2">
                    {courseItem?.instructorName}
                  </p>
                  <p className="font-bold text-[16px]">
                    ${courseItem?.pricing}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <h1>No Courses Found</h1>
          )}
        </div>
      </section>
    </div>
  );
}

export default StudentHomePage;
