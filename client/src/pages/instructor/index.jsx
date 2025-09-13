import InstructorCourses from "@/components/instructor-view/courses";
import InstructorDashboard from "@/components/instructor-view/dashboard";
import { AuthContext } from "@/context/auth-context";
import { InstructorContext } from "@/context/instructor-context";
import { fetchInstructorCourseListService } from "@/services";
import { useContext, useEffect, useState } from "react";
import { Search, Calendar, User, LogOut, BarChart3, BookOpen } from "lucide-react";

function InstructorDashboardpage() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [isOnline, setIsOnline] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const { resetCredentials, user } = useContext(AuthContext);
  const { instructorCoursesList, setInstructorCoursesList } =
    useContext(InstructorContext);

  async function fetchAllCourses() {
    const response = await fetchInstructorCourseListService();
    if (response?.success) setInstructorCoursesList(response?.data);
  }



  useEffect(() => {
    fetchAllCourses();
    
    // Set online status based on user activity
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check initial online status
    setIsOnline(navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []); // Re-fetch when user changes

  function handleLogout() {
    resetCredentials();
    sessionStorage.clear();
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
      default:
        return <InstructorDashboard listOfCourses={filteredCourses} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-xl hidden lg:block">
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-blue-100">Instructor Portal</p>
              </div>
            </div>
          </div>

        
     
          {/* Navigation Menu */}
          <nav className="flex-1 px-3 py-6">
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">Main Navigation</h4>
            </div>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setCurrentView("dashboard")}
                  className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-all duration-200 ${
                    currentView === "dashboard"
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    currentView === "dashboard" ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <BarChart3 className={`w-4 h-4 ${
                      currentView === "dashboard" ? 'text-blue-600' : 'text-gray-500'
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
                  onClick={() => setCurrentView("courses")}
                  className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-all duration-200 ${
                    currentView === "courses"
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    currentView === "courses" ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <BookOpen className={`w-4 h-4 ${
                      currentView === "courses" ? 'text-blue-600' : 'text-gray-500'
                    }`} />
                  </div>
                  <span className="font-medium">My Courses</span>
                  {currentView === "courses" && (
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4">
              <div className="lg:hidden">
                <button className="p-2 rounded-lg hover:bg-gray-100">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {currentView === "dashboard" ? "Dashboard" : "My Courses"}
                </h2>
                <p className="text-sm text-gray-500">
                  {currentView === "dashboard" 
                    ? "Monitor your courses and student progress" 
                    : "Manage your course portfolio"
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Enhanced Search */}
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
              

              
              {/* Enhanced Date Display */}
              <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
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
