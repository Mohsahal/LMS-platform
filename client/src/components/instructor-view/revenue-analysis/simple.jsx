import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, BookOpen, TrendingUp } from "lucide-react";
import PropTypes from "prop-types";

function SimpleRevenueAnalysis({ listOfCourses = [] }) {
  console.log("SimpleRevenueAnalysis - listOfCourses:", listOfCourses);
  
  // Simple calculations
  const totalCourses = Array.isArray(listOfCourses) ? listOfCourses.length : 0;
  const totalStudents = Array.isArray(listOfCourses) 
    ? listOfCourses.reduce((sum, course) => sum + (course.students?.length || 0), 0)
    : 0;
  const totalRevenue = Array.isArray(listOfCourses)
    ? listOfCourses.reduce((sum, course) => sum + ((course.students?.length || 0) * (course.pricing || 0)), 0)
    : 0;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Revenue Analysis</h1>
        <p className="text-gray-600 mt-2">Simple revenue overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-green-50">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900 mb-1">${totalRevenue.toLocaleString()}</div>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-blue-50">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900 mb-1">{totalStudents}</div>
            <p className="text-sm text-gray-600">Total Students</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-purple-50">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900 mb-1">{totalCourses}</div>
            <p className="text-sm text-gray-600">Total Courses</p>
          </CardContent>
        </Card>
      </div>

      {/* Simple Course List */}
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Course Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.isArray(listOfCourses) && listOfCourses.length > 0 ? (
              listOfCourses.map((course, index) => (
                <div key={course._id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-900">{course.title || "Untitled Course"}</h4>
                    <p className="text-sm text-gray-600">
                      {course.students?.length || 0} students • ${course.pricing || 0}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      ${((course.students?.length || 0) * (course.pricing || 0)).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Revenue</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <p>No courses available</p>
                <p className="text-sm">Create courses to see revenue data</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

SimpleRevenueAnalysis.propTypes = {
  listOfCourses: PropTypes.array,
};

export default SimpleRevenueAnalysis;
