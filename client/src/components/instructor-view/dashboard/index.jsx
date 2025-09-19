import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  DollarSign, Users, BookOpen, Award, TrendingUp, Eye
} from "lucide-react";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { getCurrentCourseProgressService } from "@/services";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

function InstructorDashboard({ listOfCourses = [] }) {
  // Separate pagination for courses and students
  const INITIAL_ROWS_COURSES = 5;
  const INITIAL_ROWS_STUDENTS = 5;
  const ROWS_CHUNK = 5;
  const [visibleCourses, setVisibleCourses] = useState(INITIAL_ROWS_COURSES);
  const [visibleStudents, setVisibleStudents] = useState(INITIAL_ROWS_STUDENTS);
  const canLoadMoreCourses = (listOfCourses?.length || 0) > visibleCourses;
  // Reset counts when data changes
  useEffect(() => { 
    setVisibleCourses(INITIAL_ROWS_COURSES);
    setVisibleStudents(INITIAL_ROWS_STUDENTS);
  }, [listOfCourses]);
  function calculateTotalStudentsAndProfit() {
    const { totalStudents, totalProfit, studentList } = listOfCourses.reduce(
      (acc, course) => {
        const studentCount = course.students.length;
        acc.totalStudents += studentCount;
        acc.totalProfit += course.pricing * studentCount;

        course.students.forEach((student) => {
          acc.studentList.push({
            courseTitle: course.title,
            courseId: course._id,
            studentName: student.studentName,
            studentEmail: student.studentEmail,
            studentId: student.studentId,
          });
        });

        return acc;
      },
      {
        totalStudents: 0,
        totalProfit: 0,
        studentList: [],
      }
    );

    return {
      totalProfit,
      totalStudents,
      studentList,
    };
  }

  const totals = calculateTotalStudentsAndProfit();
  const [actionsOpen, setActionsOpen] = useState(false);
  const [actionsLoading, setActionsLoading] = useState(false);
  const [recentActions, setRecentActions] = useState([]);
  const [actionsContext, setActionsContext] = useState({ studentName: "", courseTitle: "" });

  async function handleShowRecentActions(student) {
    if (!student?.studentId || !student?.courseId) return;
    setActionsOpen(true);
    setActionsLoading(true);
    setActionsContext({ studentName: student.studentName, courseTitle: student.courseTitle });
    try {
      const resp = await getCurrentCourseProgressService(student.studentId, student.courseId);
      if (resp?.success && resp?.data) {
        const curriculum = resp.data.courseDetails?.curriculum || [];
        const progress = resp.data.progress || [];
        const byLectureId = new Map(progress.map(p => [p.lectureId, p]));
        const actions = curriculum
          .map((lec, idx) => {
            const prog = byLectureId.get(lec._id || lec.lectureId || lec.title);
            if (!prog || !prog.viewed || !prog.dateViewed) return null;
            return {
              title: lec.title || `Lecture ${idx + 1}`,
              dateViewed: new Date(prog.dateViewed)
            };
          })
          .filter(Boolean)
          .sort((a, b) => b.dateViewed - a.dateViewed)
          .slice(0, 10);
        setRecentActions(actions);
      } else {
        setRecentActions([]);
      }
    } catch (_) {
      setRecentActions([]);
    } finally {
      setActionsLoading(false);
    }
  }
  const kpis = [
    { 
      icon: Users, 
      label: "Total Students", 
      value: totals.totalStudents,
      color: "from-gray-600 to-gray-800",
      bgColor: "bg-gray-100",
      iconColor: "text-gray-700",
      trend: "+12%",
      description: "Active enrollments"
    },
    { 
      icon: BookOpen, 
      label: "Total Courses", 
      value: listOfCourses.length,
      color: "from-gray-600 to-gray-800",
      bgColor: "bg-gray-100",
      iconColor: "text-gray-700",
      trend: "+5%",
      description: "Published courses"
    },
    { 
      icon: DollarSign, 
      label: "Total Revenue", 
      value: `$${totals.totalProfit.toLocaleString()}`,
      color: "from-gray-600 to-gray-800",
      bgColor: "bg-gray-100",
      iconColor: "text-gray-700",
      trend: "+18%",
      description: "This month"
    },
    { 
      icon: Award, 
      label: "Avg. Revenue / Course", 
      value: `$${listOfCourses.length ? Math.round(totals.totalProfit / listOfCourses.length).toLocaleString() : 0}`,
      color: "from-gray-600 to-gray-800",
      bgColor: "bg-gray-100",
      iconColor: "text-gray-700",
      trend: "+8%",
      description: "Per course"
    },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      {/* <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome back, Instructor! 👋</h1>
          <p className="text-blue-100 text-lg">Here&apos;s what&apos;s happening with your courses today</p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm">{listOfCourses.length} Active Courses</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
              <Users className="w-4 h-4" />
              <span className="text-sm">{totals.totalStudents} Students</span>
            </div>
          </div>
        </div>
      </div> */}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {kpis.map((item, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${item.bgColor}`}>
                  <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                </div>
                <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  {item.trend}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-gray-900 mb-1">{item.value}</div>
              <p className="text-sm text-gray-600 mb-2">{item.label}</p>
              <p className="text-xs text-gray-500">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Courses Overview */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">Your Courses Performance</CardTitle>
                  <p className="text-sm text-gray-500">Revenue and enrollment overview</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-700">{listOfCourses.length}</div>
                <div className="text-sm text-gray-500">Total Courses</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">Course</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">Students</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listOfCourses.slice(0, visibleCourses).map((c) => (
                    <TableRow key={c._id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium text-gray-900">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-white" />
                          </div>
                          <span>{c.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Users className="h-4 w-4 text-gray-700" />
                          <span className="font-semibold text-gray-900">{c.students?.length || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold text-green-600">${(c.students?.length || 0) * c.pricing}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {canLoadMoreCourses ? (
              <div className="flex justify-center mt-4 pb-4">
                <button
                  onClick={() => setVisibleCourses((n) => n + ROWS_CHUNK)}
                  className="px-6 py-2 text-sm font-semibold border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Load more courses
                </button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Recent Students */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">Recent Students</CardTitle>
                  <p className="text-sm text-gray-500">Latest enrollments and activity</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-700">{Math.min(10, totals.studentList.length)}</div>
                <div className="text-sm text-gray-500">New Students</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">Course Name</TableHead>
                    <TableHead className="font-semibold text-gray-700">Student Name</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {totals.studentList.slice(0, visibleStudents).map((s, i) => (
                    <TableRow key={`${s.studentEmail}-${i}`} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium text-gray-900">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-white" />
                          </div>
                          <span className="truncate max-w-32">{s.courseTitle}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-gray-800">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <span>{s.studentName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <button 
                          className="p-2 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors"
                          onClick={() => handleShowRecentActions(s)}
                          title="View recent actions"
                        >
                          <Eye className="h-4 w-4 text-gray-500" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {totals.studentList.length > visibleStudents ? (
              <div className="flex justify-center mt-4 pb-4">
                <button
                  onClick={() => setVisibleStudents((n) => n + ROWS_CHUNK)}
                  className="px-6 py-2 text-sm font-semibold border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Load more students
                </button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Dialog open={actionsOpen} onOpenChange={setActionsOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Recent actions</DialogTitle>
          </DialogHeader>
          <div className="mt-2 text-sm text-gray-600">
            <div className="mb-3">
              <span className="font-semibold text-gray-900">{actionsContext.studentName}</span>
              <span className="mx-2">•</span>
              <span className="text-gray-700">{actionsContext.courseTitle}</span>
            </div>
            {actionsLoading ? (
              <div className="py-6 text-center">Loading...</div>
            ) : recentActions.length > 0 ? (
              <ul className="space-y-2">
                {recentActions.map((a, idx) => (
                  <li key={idx} className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                    <span className="text-gray-900">{a.title}</span>
                    <span className="text-xs text-gray-500">{a.dateViewed.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-6 text-center text-gray-500">No recent actions found</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

InstructorDashboard.propTypes = {
  listOfCourses: PropTypes.array,
};

export default InstructorDashboard;
