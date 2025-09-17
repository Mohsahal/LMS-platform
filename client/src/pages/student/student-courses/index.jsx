import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import { fetchStudentBoughtCoursesService } from "@/services";
import { Watch } from "lucide-react";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function StudentCoursesPage() {
  const { auth } = useContext(AuthContext);
  const { studentBoughtCoursesList, setStudentBoughtCoursesList } =
    useContext(StudentContext);
  const navigate = useNavigate();

  async function fetchStudentBoughtCourses() {
    const response = await fetchStudentBoughtCoursesService(auth?.user?._id);
    if (response?.success) {
      setStudentBoughtCoursesList(response?.data);
    }
    console.log(response);
  }
  useEffect(() => {
    fetchStudentBoughtCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Watch className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">My Courses</h1>
              <p className="text-gray-600 text-lg">Continue your learning journey</p>
            </div>
          </div>
          {/* <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Watch className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Your Learning Dashboard</h3>
                <p className="text-sm text-gray-600">Track your progress and continue where you left off</p>
              </div>
            </div>
          </div> */}
        </div>

        {studentBoughtCoursesList && studentBoughtCoursesList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {studentBoughtCoursesList.map((course) => (
              <Card key={course.id} className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-transform duration-300 hover:-translate-y-1">
                <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                  <img
                    src={course?.courseImage}
                    alt={course?.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/90 text-gray-700 shadow-sm backdrop-blur-sm">Enrolled</span>
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <CardContent className="p-5">
                  <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {course?.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                      {course?.instructorName?.charAt(0)}
                    </div>
                    <span className="font-medium">{course?.instructorName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-100">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Available
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Self-paced
                    </span>
                  </div>
              </CardContent>
                <CardFooter className="p-5 pt-0">
                <Button
                  onClick={() =>
                    navigate(`/course-progress/${course?.courseId}`)
                  }
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md hover:shadow-lg transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <Watch className="mr-2 h-4 w-4" />
                    Continue Learning
                </Button>
              </CardFooter>
            </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Watch className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No courses yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven&apos;t enrolled in any courses yet. Start your learning journey by exploring our course catalog.
            </p>
            <Button
              onClick={() => navigate("/courses")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Browse Courses
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentCoursesPage;
