import InstructorCourses from "@/components/instructor-view/courses";
import InstructorDashboard from "@/components/instructor-view/dashboard";
import RevenueAnalysis from "@/components/instructor-view/revenue-analysis/real-time";
import { AuthContext } from "@/context/auth-context";
import { InstructorContext } from "@/context/instructor-context";
import { fetchInstructorCourseListService } from "@/services";
import { useContext, useEffect, useState, useCallback, useRef } from "react"; // Added useRef
import { Search, Calendar, LogOut, BarChart3, BookOpen, TrendingUp, Menu, X } from "lucide-react";
import { gsap } from "gsap"; // Import GSAP
import { useNavigate } from "react-router-dom";

function InstructorDashboardpage() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sidebarRef = useRef(null); // Ref for the sidebar
  const mainContentRef = useRef(null); // Ref for the main content
  const navigate = useNavigate();

  const { logout } = useContext(AuthContext);
  const { instructorCoursesList, setInstructorCoursesList } =
    useContext(InstructorContext);

  const fetchAllCourses = useCallback(async () => {
    const response = await fetchInstructorCourseListService();
    if (response?.success) setInstructorCoursesList(response?.data);
  }, [setInstructorCoursesList]);


  useEffect(() => {
    fetchAllCourses();
  }, [fetchAllCourses]); // Re-fetch when user changes

  // GSAP Animations
  useEffect(() => {
    gsap.fromTo(sidebarRef.current, 
      { x: -100, opacity: 0 }, 
      { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    );
    gsap.fromTo(mainContentRef.current, 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.2 }
    );
  }, []); // Run animations once on component mount

  function handleLogout() {
    logout();
    // Navigate to auth page after logout
    navigate("/auth");
  }


  // Filter courses based on search query
  const filteredCourses = instructorCoursesList?.filter(course => 
    course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };



  // Render the appropriate component based on current view
  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <InstructorDashboard listOfCourses={filteredCourses} />;
      case "courses":
        return <InstructorCourses listOfCourses={filteredCourses} />;
      case "revenue":
        return <RevenueAnalysis listOfCourses={filteredCourses} />;
      default:
        return <InstructorDashboard listOfCourses={filteredCourses} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        ref={sidebarRef} 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-gradient-to-r from-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-lg text-white font-semibold">Instructor Portal</p>
              </div>
            </div>
            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/20 text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        
     
          {/* Navigation Menu */}
          <nav className="flex-1 px-3 py-6">
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">Main Navigation</h4>
            </div>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => {
                    setCurrentView("dashboard");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-all duration-200 ${
                    currentView === "dashboard"
                      ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    currentView === "dashboard" ? 'bg-gray-200' : 'bg-gray-100'
                  }`}>
                    <BarChart3 className={`w-4 h-4 ${
                      currentView === "dashboard" ? 'text-gray-700' : 'text-gray-500'
                    }`} />
                  </div>
                  <span className="font-medium">Dashboard</span>
                  {currentView === "dashboard" && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView("courses");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-all duration-200 ${
                    currentView === "courses"
                      ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    currentView === "courses" ? 'bg-gray-200' : 'bg-gray-100'
                  }`}>
                    <BookOpen className={`w-4 h-4 ${
                      currentView === "courses" ? 'text-gray-700' : 'text-gray-500'
                    }`} />
                  </div>
                  <span className="font-medium">My Courses</span>
                  {currentView === "courses" && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView("revenue");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-all duration-200 ${
                    currentView === "revenue"
                      ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    currentView === "revenue" ? 'bg-gray-200' : 'bg-gray-100'
                  }`}>
                    <TrendingUp className={`w-4 h-4 ${
                      currentView === "revenue" ? 'text-gray-700' : 'text-gray-500'
                    }`} />
                  </div>
                  <span className="font-medium">Revenue Analysis</span>
                  {currentView === "revenue" && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </button>
              </li>
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-all duration-200 group"
            >
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                <LogOut className="w-4 h-4 text-red-600" />
              </div>
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div ref={mainContentRef} className="flex-1 flex flex-col overflow-hidden"> {/* Added ref */}
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  {currentView === "dashboard" ? "Dashboard" : 
                   currentView === "courses" ? "My Courses" : 
                   currentView === "revenue" ? "Revenue Analysis" : "Dashboard"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  {currentView === "dashboard" 
                    ? "Monitor your courses and student progress" 
                    : currentView === "courses"
                    ? "Manage your course portfolio"
                    : currentView === "revenue"
                    ? "Analyze revenue trends and performance metrics"
                    : "Monitor your courses and student progress"
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Mobile Search */}
              <div className="relative md:hidden">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-32 transition-all duration-200"
                />
                {searchQuery && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {/* Desktop Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses, students..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 transition-all duration-200"
                />
                {searchQuery && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              
              {/* Date Display */}
              <div className="text-xs sm:text-sm text-gray-600 bg-gray-50 px-2 sm:px-3 py-2 rounded-lg flex items-center gap-1 sm:gap-2">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <span className="sm:hidden">
                  {new Date().toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>


    </div>
  );
}

export default InstructorDashboardpage;