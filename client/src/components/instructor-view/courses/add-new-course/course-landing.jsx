import FormControls from "@/components/common-form/form-controls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { courseLandingPageFormControls } from "@/config";
import { InstructorContext } from "@/context/instructor-context";
import { useContext } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function CourseLanding() {
  const { courseLandingFormData, setCourseLandingFormData } =
    useContext(InstructorContext);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Course Landing Page</CardTitle>
          <div className="text-sm text-gray-600">
            Live Preview
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <FormControls
          formControls={courseLandingPageFormControls}
          formData={courseLandingFormData}
          setFormData={setCourseLandingFormData}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="md:col-span-2 border rounded-lg p-4">
            <h3 className="text-xl font-extrabold">{courseLandingFormData?.title || "Course title"}</h3>
            <p className="text-gray-700 mt-2">{courseLandingFormData?.subtitle || "Subtitle"}</p>
            <p className="text-sm text-gray-500 mt-2">{courseLandingFormData?.description || "Description..."}</p>
          </div>
          <div className="space-y-3">
            <Label>Certificate Title (optional)</Label>
            <Input
              placeholder="e.g., Certificate of Completion"
              value={courseLandingFormData?.certificateTitle || ""}
              onChange={(e)=>setCourseLandingFormData({ ...courseLandingFormData, certificateTitle: e.target.value })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CourseLanding;
