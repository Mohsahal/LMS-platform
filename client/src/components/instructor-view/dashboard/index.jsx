import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Users, BookOpen, Award } from "lucide-react";
import PropTypes from "prop-types";

function InstructorDashboard({ listOfCourses = [] }) {
  function calculateTotalStudentsAndProfit() {
    const { totalStudents, totalProfit, studentList } = listOfCourses.reduce(
      (acc, course) => {
        const studentCount = course.students.length;
        acc.totalStudents += studentCount;
        acc.totalProfit += course.pricing * studentCount;

        course.students.forEach((student) => {
          acc.studentList.push({
            courseTitle: course.title,
            studentName: student.studentName,
            studentEmail: student.studentEmail,
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
  const kpis = [
    { icon: Users, label: "Total Students", value: totals.totalStudents },
    { icon: BookOpen, label: "Total Courses", value: listOfCourses.length },
    { icon: DollarSign, label: "Total Revenue", value: totals.totalProfit },
    { icon: Award, label: "Avg. Revenue / Course", value: listOfCourses.length ? Math.round(totals.totalProfit / listOfCourses.length) : 0 },
  ];

  return (
    <div className="space-y-8">
      {/* KPI strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.map((item, index) => (
          <Card key={index} className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
              <item.icon className="h-5 w-5 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Courses overview */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Your Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listOfCourses.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell>{c.students?.length}</TableCell>
                    <TableCell>${c.pricing}</TableCell>
                    <TableCell>${(c.students?.length || 0) * c.pricing}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Students table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Student Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {totals.studentList.slice(0, 10).map((s, i) => (
                  <TableRow key={`${s.studentEmail}-${i}`}>
                    <TableCell className="font-medium">{s.courseTitle}</TableCell>
                    <TableCell>{s.studentName}</TableCell>
                    <TableCell>{s.studentEmail}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

InstructorDashboard.propTypes = {
  listOfCourses: PropTypes.array,
};

export default InstructorDashboard;
