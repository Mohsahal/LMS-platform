import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  courseCurriculumInitialFormData,
  courseLandingInitialFormData,
} from "@/config";
import { InstructorContext } from "@/context/instructor-context";
import { Delete, Edit, Plus, BookOpen, Users, DollarSign } from "lucide-react";
import { useContext } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

function InstructorCourses({ listOfCourses }) {
  const navigate = useNavigate();
  const {
    setCurrentEditedCourseId,
    setCourseLandingFormData,
    setCourseCurriculumFormData,
  } = useContext(InstructorContext);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
          <div className="flex justify-between flex-row items-center">
            <div>
              <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Course Management</CardTitle>
              <p className="text-gray-600">Create, edit, and manage your online courses</p>
            </div>
            <Button
              onClick={() => {
                setCurrentEditedCourseId(null);
                setCourseLandingFormData(courseLandingInitialFormData);
                setCourseCurriculumFormData(courseCurriculumInitialFormData);
                navigate("/instructor/create-new-course");
              }}
              className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Course
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {listOfCourses && listOfCourses.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-700 text-left">Course</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">Students</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">Revenue</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listOfCourses.map((course) => (
                    <TableRow key={course?._id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                      <TableCell className="text-left py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-lg">{course?.title}</div>
                            <div className="text-sm text-gray-500">Course ID: {course?._id?.slice(-8)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Users className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-gray-900 text-lg">{course?.students?.length || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <div className="flex items-center justify-center gap-2">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <span className="font-bold text-green-600 text-lg">
                            ${(course?.students?.length || 0) * (course?.pricing || 0)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => {
                              navigate(`/instructor/edit-course/${course?._id}`);
                            }}
                            variant="outline"
                            size="sm"
                            className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                          >
                            <Delete className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses yet</h3>
              <p className="text-gray-600 mb-6">Start building your online course empire today!</p>
              <Button
                onClick={() => {
                  setCurrentEditedCourseId(null);
                  setCourseLandingFormData(courseLandingInitialFormData);
                  setCourseCurriculumFormData(courseCurriculumInitialFormData);
                  navigate("/instructor/create-new-course");
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Course
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

InstructorCourses.propTypes = {
  listOfCourses: PropTypes.array,
};

export default InstructorCourses;
