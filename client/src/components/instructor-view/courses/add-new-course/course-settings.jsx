import MediaProgressbar from "@/components/media-progress-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InstructorContext } from "@/context/instructor-context";
import { mediaUploadService } from "@/services";
import { useContext } from "react";
import { Switch } from "@/components/ui/switch";
import { Settings, Image, Award, Target, Upload as UploadIcon } from "lucide-react";

function CourseSettings() {
  const {
    courseLandingFormData,
    setCourseLandingFormData,
    mediaUploadProgress,
    setMediaUploadProgress,
    mediaUploadProgressPercentage,
    setMediaUploadProgressPercentage,
  } = useContext(InstructorContext);

  async function handleImageUploadChange(event) {
    const selectedImage = event.target.files[0];

    if (selectedImage) {
      const imageFormData = new FormData();
      imageFormData.append("file", selectedImage);

      try {
        setMediaUploadProgress(true);
        const response = await mediaUploadService(
          imageFormData,
          setMediaUploadProgressPercentage
        );
        if (response.success) {
          setCourseLandingFormData({
            ...courseLandingFormData,
            image: response.data.url,
          });
          setMediaUploadProgress(false);
        }
      } catch (e) {
        console.log(e);
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Course Settings</CardTitle>
              <p className="text-gray-600 mt-1">Configure course image, certificates, and completion requirements</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Course Image Section */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Image className="w-5 h-5 text-blue-600" />
                  Course Image
                </h3>
                
                {mediaUploadProgress && (
                  <div className="mb-4">
                    <MediaProgressbar
                      isMediaUploading={mediaUploadProgress}
                      progress={mediaUploadProgressPercentage}
                    />
                  </div>
                )}

                {courseLandingFormData?.image ? (
                  <div className="space-y-4">
                    <div className="relative group">
                      <img 
                        src={courseLandingFormData.image} 
                        alt="Course" 
                        className="w-full h-48 object-cover rounded-lg shadow-md"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Label htmlFor="replace-image" className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors">
                            <UploadIcon className="w-4 h-4 mr-2 inline" />
                            Replace Image
                          </Label>
                        </div>
                      </div>
                    </div>
                    <Input
                      id="replace-image"
                      onChange={handleImageUploadChange}
                      type="file"
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors duration-200">
                    <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Course Image</h4>
                    <p className="text-gray-600 mb-4">Choose a high-quality image that represents your course</p>
                    <Label htmlFor="course-image" className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Select Image
                    </Label>
                    <Input
                      id="course-image"
                      onChange={handleImageUploadChange}
                      type="file"
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Certificate & Completion Settings */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-600" />
                  Certificate Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-green-600" />
                      <div>
                        <Label className="text-sm font-medium text-gray-900">Issue certificate on completion</Label>
                        <p className="text-xs text-gray-500">Students receive a certificate when they finish the course</p>
                      </div>
                    </div>
                    <Switch
                      id="certificateEnabled"
                      checked={Boolean(courseLandingFormData?.certificateEnabled)}
                      onCheckedChange={(v) => setCourseLandingFormData({ 
                        ...courseLandingFormData, 
                        certificateEnabled: v 
                      })}
                    />
                  </div>
                  {Boolean(courseLandingFormData?.certificateEnabled) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="certificateCourseName" className="text-sm font-medium text-gray-700 mb-2 block">Certificate Course Name</Label>
                        <Input
                          id="certificateCourseName"
                          placeholder="Name to print on certificate"
                          value={courseLandingFormData?.certificateCourseName || ""}
                          onChange={(e) => setCourseLandingFormData({
                            ...courseLandingFormData,
                            certificateCourseName: e.target.value,
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="certificateTemplateUrl" className="text-sm font-medium text-gray-700 mb-2 block">Template Image URL</Label>
                        <Input
                          id="certificateTemplateUrl"
                          placeholder="https://.../certificate.png"
                          value={courseLandingFormData?.certificateTemplateUrl || ""}
                          onChange={(e) => setCourseLandingFormData({
                            ...courseLandingFormData,
                            certificateTemplateUrl: e.target.value,
                          })}
                        />
                        <p className="text-xs text-gray-500 mt-1">Provide the exact template background image URL. We will overlay text precisely.</p>
                      </div>
                      <div>
                        <Label htmlFor="certificateIssuer" className="text-sm font-medium text-gray-700 mb-2 block">Issuer Title</Label>
                        <Input
                          id="certificateIssuer"
                          placeholder="Chief Executive Officer"
                          value={courseLandingFormData?.certificateIssuer || ""}
                          onChange={(e) => setCourseLandingFormData({
                            ...courseLandingFormData,
                            certificateIssuer: e.target.value,
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="certificateOrganization" className="text-sm font-medium text-gray-700 mb-2 block">Issuer Organization</Label>
                        <Input
                          id="certificateOrganization"
                          placeholder="BRAVYNEX ENGINEERING"
                          value={courseLandingFormData?.certificateOrganization || ""}
                          onChange={(e) => setCourseLandingFormData({
                            ...courseLandingFormData,
                            certificateOrganization: e.target.value,
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="certificateFrom" className="text-sm font-medium text-gray-700 mb-2 block">From (Printed)</Label>
                        <Input
                          id="certificateFrom"
                          placeholder="BRAVYNEX ENGINEERING"
                          value={courseLandingFormData?.certificateFrom || ""}
                          onChange={(e) => setCourseLandingFormData({
                            ...courseLandingFormData,
                            certificateFrom: e.target.value,
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="defaultCertificateGrade" className="text-sm font-medium text-gray-700 mb-2 block">Default Grade</Label>
                        <Input
                          id="defaultCertificateGrade"
                          placeholder="A"
                          value={courseLandingFormData?.defaultCertificateGrade || ""}
                          onChange={(e) => setCourseLandingFormData({
                            ...courseLandingFormData,
                            defaultCertificateGrade: e.target.value,
                          })}
                        />
                        <p className="text-xs text-gray-500 mt-1">Used if your grading logic isn&apos;t provided elsewhere.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Completion Requirements
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="passingScore" className="text-sm font-medium text-gray-700 mb-2 block">
                      Passing Score (%)
                    </Label>
                    <div className="relative">
                      <Input
                        id="passingScore"
                        type="number"
                        placeholder="e.g., 70"
                        value={courseLandingFormData?.passingScore || ""}
                        onChange={(e) => setCourseLandingFormData({ 
                          ...courseLandingFormData, 
                          passingScore: e.target.value 
                        })}
                        className="w-full pl-10"
                        min="0"
                        max="100"
                      />
                      <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum score required to complete the course
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CourseSettings;
