import InstructorCourses from "@/components/instructor-view/courses";
import InstructorDashboard from "@/components/instructor-view/dashboard";
import { AuthContext } from "@/context/auth-context";
import { InstructorContext } from "@/context/instructor-context";
import { fetchInstructorCourseListService, getUserNotificationsService, markNotificationAsReadService } from "@/services";
import { useContext, useEffect, useState } from "react";
import { Search, Bell, Calendar, User, LogOut, BarChart3, BookOpen } from "lucide-react";

function InstructorDashboardpage() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [isOnline, setIsOnline] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const { resetCredentials, user } = useContext(AuthContext);
  const { instructorCoursesList, setInstructorCoursesList } =
    useContext(InstructorContext);

  async function fetchAllCourses() {
    const response = await fetchInstructorCourseListService();
    if (response?.success) setInstructorCoursesList(response?.data);
  }

  // Fetch real notifications from server
  async function fetchNotifications() {
    if (!user?.userEmail) {
      console.log('No user email found, skipping notification fetch');
      return;
    }
    
    try {
      setNotificationsLoading(true);
      console.log('Fetching notifications for:', user.userEmail);
      
      const response = await getUserNotificationsService(user.userEmail, {
        limit: 50,
        unreadOnly: false
      });
      
      console.log('Notification API response:', response);
      
      if (response?.success) {
        const notificationsList = response.data.notifications || [];
        console.log('Setting notifications:', notificationsList.length);
        setNotifications(notificationsList);
      } else {
        console.error('Notification response not successful:', response);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fallback to empty array if API fails
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  }

  useEffect(() => {
    fetchAllCourses();
    fetchNotifications();
    
    // Set online status based on user activity
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check initial online status
    setIsOnline(navigator.onLine);
    
    // Set up periodic notification refresh (every 30 seconds)
    const notificationInterval = setInterval(() => {
      if (user?.userEmail) {
        fetchNotifications();
      }
    }, 30000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(notificationInterval);
    };
  }, [user?.userEmail]); // Re-fetch when user changes

  function handleLogout() {
    resetCredentials();
    sessionStorage.clear();
  }

  // Get user data from context or fallback to defaults
  const userEmail = user?.userEmail || user?.email || "admin@elearn.com";
  const userName = user?.userName || user?.name || user?.firstName || "Instructor";
  const userRole = user?.role || "Instructor";

  // Filter courses based on search query
  const filteredCourses = instructorCoursesList?.filter(course => 
    course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      // Call API to mark as read
      const response = await markNotificationAsReadService(notificationId);
      
      if (response?.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Get unread notifications count
  const unreadCount = notifications.filter(n => !n.isRead).length;

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
                {/* <h1 className="text-xl font-bold text-white">E-Learn Pro</h1> */}
                <p className="text-xs text-blue-100">Instructor Portal</p>
              </div>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-lg truncate">{userName}</h3>
                <p className="text-sm text-gray-600 truncate">{userEmail}</p>
                <p className="text-xs text-gray-500 mt-1">{userRole}</p>
                <div className="flex items-center gap-1 mt-2">
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-xs font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
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
              
              {/* Enhanced Notifications */}
              <div className="relative">
                                                  <button 
                   onClick={() => {
                     if (!showNotifications) {
                       fetchNotifications(); // Refresh notifications when opening
                     }
                     setShowNotifications(!showNotifications);
                   }}
                   disabled={notificationsLoading}
                   className="p-2 rounded-lg hover:bg-gray-100 relative disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {notificationsLoading ? (
                     <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                   ) : (
                     <Bell className="w-5 h-5 text-gray-600" />
                   )}
                   {unreadCount > 0 && (
                     <div className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                       {unreadCount > 9 ? '9+' : unreadCount}
                     </div>
                   )}
                 </button>
                 
                 {/* Test notification button */}
                 <button
                   onClick={async () => {
                     try {
                       console.log('Testing notification system...');
                       const accessToken = JSON.parse(localStorage.getItem("accessToken")) || "";
                       if (!accessToken) {
                         alert("No access token found. Please login first.");
                         return;
                       }
                       
                       // First test if the notification system is accessible
                       console.log('Testing notification system access...');
                       const testResponse = await fetch('http://localhost:5000/notifications/test', {
                         method: 'GET',
                         credentials: 'include',
                         headers: {
                           'Content-Type': 'application/json',
                           'Authorization': `Bearer ${accessToken}`
                         }
                       });
                       
                       const testData = await testResponse.json();
                       console.log('Test response:', testData);
                       
                       if (testData.success) {
                         // Now create a test notification
                         console.log('Creating test notification...');
                         const response = await fetch('http://localhost:5000/notifications/create', {
                           method: 'POST',
                           credentials: 'include',
                           headers: {
                             'Content-Type': 'application/json',
                             'Authorization': `Bearer ${accessToken}`
                           },
                           body: JSON.stringify({
                             userId: user?.userEmail,
                             userType: 'instructor',
                             type: 'system',
                             title: 'Test Notification',
                             message: 'This is a test notification to verify the system is working.'
                           })
                         });
                         
                         const data = await response.json();
                         console.log('Test notification response:', data);
                         alert(`Test notification: ${JSON.stringify(data)}`);
                         
                         // Refresh notifications
                         await fetchNotifications();
                       } else {
                         alert(`Notification system test failed: ${JSON.stringify(testData)}`);
                       }
                     } catch (error) {
                       console.error('Test notification failed:', error);
                       alert(`Test notification failed: ${error.message}`);
                     }
                   }}
                   className="ml-2 p-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                   title="Test notification system"
                 >
                   Test
                 </button>
                 

                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                         <div className="p-4 border-b border-gray-200">
                       <div className="flex items-center justify-between">
                         <div>
                           <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                           <p className="text-sm text-gray-500">{unreadCount} unread</p>
                         </div>
                         <button
                           onClick={fetchNotifications}
                           disabled={notificationsLoading}
                           className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                           title="Refresh notifications"
                         >
                           <svg className={`w-4 h-4 ${notificationsLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                           </svg>
                         </button>
                       </div>
                     </div>
                                         <div className="max-h-96 overflow-y-auto">
                       {notificationsLoading ? (
                         <div className="p-4 text-center text-gray-500">
                           <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                           Loading notifications...
                         </div>
                       ) : notifications.length > 0 ? (
                         notifications.map((notification) => (
                           <div
                             key={notification._id}
                             onClick={() => markNotificationAsRead(notification._id)}
                             className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                               !notification.isRead ? 'bg-blue-50' : ''
                             }`}
                           >
                             <div className="flex items-start gap-3">
                               <div className={`w-2 h-2 rounded-full mt-2 ${
                                 notification.type === 'payment' ? 'bg-green-500' :
                                 notification.type === 'enrollment' ? 'bg-blue-500' :
                                 notification.type === 'course_completion' ? 'bg-purple-500' :
                                 notification.type === 'course_published' ? 'bg-indigo-500' :
                                 notification.type === 'achievement' ? 'bg-yellow-500' :
                                 'bg-gray-500'
                               }`}></div>
                               <div className="flex-1">
                                 <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                 <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                                 <p className="text-xs text-gray-500 mt-2">
                                   {new Date(notification.createdAt).toLocaleDateString('en-US', {
                                     month: 'short',
                                     day: 'numeric',
                                     hour: '2-digit',
                                     minute: '2-digit'
                                   })}
                                 </p>
                               </div>
                               {!notification.isRead && (
                                 <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                               )}
                             </div>
                           </div>
                         ))
                       ) : (
                         <div className="p-4 text-center text-gray-500">
                           No notifications yet
                         </div>
                       )}
                     </div>
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

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
}

export default InstructorDashboardpage;
