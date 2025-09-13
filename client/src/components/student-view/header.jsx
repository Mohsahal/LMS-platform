import { TvMinimalPlay, BookOpen, Search, User, LogOut, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useContext, useState } from "react";
import { AuthContext } from "@/context/auth-context";
import logoImage from "/ashiwin_lap_logo.png";


function StudentViewCommonHeader() {
  const navigate = useNavigate();
  const { resetCredentials, auth, logout } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");

  function handleLogout() {
    if (typeof logout === "function") {
      logout();
    } else {
      resetCredentials();
      sessionStorage.clear();
    }
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    const term = (searchTerm || "").trim();
    if (!term) return;
    navigate(`/courses?search=${encodeURIComponent(term)}`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto w-full px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center">
            <Link to="/home" className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200">
              <img 
                src={logoImage} 
                alt="BRAVYNEX Engineering Logo" 
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-10 h-10 bg-gray-700 rounded-lg items-center justify-center hidden">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">BRAVYNEX</span>
            </Link>
          </div>

          {/* Center nav + search */}
          <div className="hidden md:flex items-center gap-8 flex-1 justify-center mx-8">
            <nav className="flex items-center gap-6">
              <Button 
                variant="ghost" 
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors duration-200" 
                onClick={() => navigate("/home")}
              >
                Home
              </Button>
              <Button 
                variant="ghost" 
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors duration-200" 
                onClick={() => navigate("/about")}
              >
                About
              </Button>
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors duration-200"
                onClick={() => {
                  if (!location.pathname.includes("/courses")) navigate("/courses");
                }}
              >
                Explore
              </Button>
            </nav>
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="search"
                  aria-label="Search courses"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search courses..."
                  className="w-full h-10 pl-10 pr-4 rounded-md border border-gray-300 bg-white text-sm outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-400"
                />
              </div>
              <Button 
                type="submit" 
                className="h-10 px-4 bg-gray-500 hover:bg-gray-700 text-white rounded-md transition-colors duration-200"
              >
                Search
              </Button>
            </form>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate("/student-courses")}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 rounded-md transition-colors duration-200"
            >
              <TvMinimalPlay className="w-4 h-4" />
              My Courses
            </Button>
            
            {/* Account menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 hover:bg-gray-50 transition-colors duration-200">
                  <div className="w-8 h-8 bg-gray-600 rounded-md flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[140px] truncate">
                    {auth?.user?.userName || "Account"}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-lg rounded-md">
                <DropdownMenuLabel className="px-4 py-3 bg-gray-50">
                  <div className="text-sm text-gray-500">Signed in as</div>
                  <div className="font-medium text-gray-900 truncate">{auth?.user?.userEmail || auth?.user?.userName}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => navigate("/student-courses")}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <TvMinimalPlay className="w-4 h-4 text-gray-600" />
                  <span>My Courses</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-gray-600" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 cursor-pointer text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile search & nav */}
        <div className="md:hidden pb-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Button 
              variant="ghost" 
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors duration-200" 
              onClick={() => navigate("/home")}
            >
              Home
            </Button>
            <Button 
              variant="ghost" 
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors duration-200" 
              onClick={() => navigate("/about")}
            >
              About
            </Button>
            <Button 
              variant="ghost" 
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors duration-200" 
              onClick={() => navigate("/courses")}
            >
              Explore
            </Button>
            <Button 
              variant="ghost" 
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors duration-200" 
              onClick={() => navigate("/student-courses")}
            >
              My Courses
            </Button>
          </div>
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                aria-label="Search courses"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search courses..."
                className="w-full h-10 pl-10 pr-4 rounded-md border border-gray-300 bg-white text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
              />
            </div>
            <Button 
              type="submit" 
              className="h-10 px-4 bg-gray-400 hover:bg-gray-400 text-white rounded-md transition-colors duration-200"
            >
              Search
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}

export default StudentViewCommonHeader;
