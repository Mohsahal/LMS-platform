import { TvMinimalPlay } from "lucide-react";
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
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto w-full p-3">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center">
            <Link to="/home" className="flex items-center hover:opacity-90">
              <span className="font-extrabold md:text-base text-[14px] tracking-wide">BRAVYNEX ENGINEERING</span>
            </Link>
          </div>

          {/* Center nav + search */}
          <div className="hidden md:flex items-center gap-4 flex-1 justify-center mx-4">
            <nav className="flex items-center gap-3 text-[14px] whitespace-nowrap">
              <Button variant="ghost" className="px-3" onClick={() => navigate("/home")}>Home</Button>
              <Button variant="ghost" className="px-3" onClick={() => navigate("/about")}>About</Button>
              <Button
                variant="ghost"
                className="px-3"
                onClick={() => {
                  if (!location.pathname.includes("/courses")) navigate("/courses");
                }}
              >
                Explore
              </Button>
            </nav>
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full max-w-2xl">
              <input
                type="search"
                aria-label="Search courses"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for anything..."
                className="flex-1 h-10 rounded-md border border-gray-300 bg-white/90 px-3 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black"
              />
              <Button type="submit" className="h-10 px-4 rounded-md border border-gray-300 bg-black text-white hover:bg-black/90 text-xs">Search</Button>
            </form>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <div
              onClick={() => navigate("/student-courses")}
              className="hidden md:flex cursor-pointer items-center gap-2"
            >
              <span className="font-semibold text-sm">My Courses</span>
              <TvMinimalPlay className="w-6 h-6" />
            </div>
            {/* Account menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-2 py-1 hover:bg-gray-50">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black text-white text-sm font-semibold">
                    {(auth?.user?.userName || "U").slice(0,1).toUpperCase()}
                  </span>
                  <span className="hidden sm:block text-sm font-medium max-w-[140px] truncate">
                    {auth?.user?.userName || "Account"}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  Signed in as
                  <div className="font-semibold truncate">{auth?.user?.userEmail || auth?.user?.userName}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/student-courses")}>My Courses</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile")}>Account</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile search & nav */}
        <div className="md:hidden pb-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="px-3" onClick={() => navigate("/home")}>Home</Button>
            <Button variant="ghost" className="px-3" onClick={() => navigate("/about")}>About</Button>
            <Button variant="ghost" className="px-3" onClick={() => navigate("/courses")}>Explore</Button>
            <Button variant="ghost" className="px-3" onClick={() => navigate("/student-courses")}>My Courses</Button>
          </div>
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <input
              type="search"
              aria-label="Search courses"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for anything..."
              className="flex-1 h-10 rounded-md border border-gray-300 bg-white/90 px-3 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black"
            />
            <Button type="submit" className="h-10 px-4 rounded-md border border-gray-300 bg-black hover:bg-black/90 text-xs">Search</Button>
          </form>
        </div>
      </div>
    </header>
  );
}

export default StudentViewCommonHeader;
