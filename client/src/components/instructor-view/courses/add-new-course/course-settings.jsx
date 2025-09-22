import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InstructorContext } from "@/context/instructor-context";
import { mediaUploadService } from "@/services";
import { useContext, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Settings, Image, Award, Target, Upload as UploadIcon } from "lucide-react";
import { SecureInstructorInput, SecureInstructorFileUpload } from "@/components/security/SecureInstructorForm";

function CourseSettings() {
  const {
    courseLandingFormData,
    setCourseLandingFormData,
    mediaUploadProgress,
    setMediaUploadProgress,
    // mediaUploadProgressPercentage,
    // setMediaUploadProgressPercentage,
  } = useContext(InstructorContext);

  const [uploadError, setUploadError] = useState('');

  async function handleImageUploadChange(files) {
    if (!files || files.length === 0) return;
    
    const selectedImage = files[0];
    setUploadError('');

    if (selectedImage) {
      const imageFormData = new FormData();
      imageFormData.append("file", selectedImage);

      try {
        setMediaUploadProgress(true);
        const response = await mediaUploadService(
          imageFormData,
          () => {}
        );
        if (response.success) {
          setCourseLandingFormData({
            ...courseLandingFormData,
            image: response.data.url,
          });
          setMediaUploadProgress(false);
        } else {
          setUploadError('Failed to upload image');
        }
      } catch (e) {
        console.log(e);
        setUploadError('Upload failed. Please try again.');
      } finally {
        setMediaUploadProgress(false);
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
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
                  {mediaUploadProgress && (
                    <span className="ml-3 flex items-center gap-2 text-blue-600 text-sm">
                      <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                      Uploading...
                    </span>
                  )}
                </h3>
                
                {/* Upload banner removed as requested */}

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
                          <SecureInstructorFileUpload
                            onChange={handleImageUploadChange}
                            accept="image/*"
                            maxSize={10 * 1024 * 1024} // 10MB
                            label="Replace Image"
                            description="Click to replace the current image"
                            className="bg-white text-gray-900 px-4 py-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <SecureInstructorFileUpload
                    onChange={handleImageUploadChange}
                    accept="image/*"
                    maxSize={10 * 1024 * 1024} // 10MB
                    label="Upload Course Image"
                    description="Choose a high-quality image that represents your course (Max 10MB)"
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors duration-200"
                  />
                )}
                
                {uploadError && (
                  <p className="text-red-500 text-sm mt-2">{uploadError}</p>
                )}
              </div>
            </div>

            {/* Certificate & Completion Settings */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-gray-700" />
                  Certificate Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-gray-700" />
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
                        <SecureInstructorInput
                          label="Certificate Course Name"
                          placeholder="Name to print on certificate"
                          value={courseLandingFormData?.certificateCourseName || ""}
                          onChange={(e) => setCourseLandingFormData({
                            ...courseLandingFormData,
                            certificateCourseName: e.target.value,
                          })}
                          maxLength={100}
                          required
                        />
                      </div>
                      {/* <div>
                        <SecureInstructorInput
                          label="Template Image URL"
                          type="url"
                          placeholder="https://.../certificate.png"
                          value={courseLandingFormData?.certificateTemplateUrl || ""}
                          onChange={(e) => setCourseLandingFormData({
                            ...courseLandingFormData,
                            certificateTemplateUrl: e.target.value,
                          })}
                          maxLength={500}
                          description="Provide the exact template background image URL. We will overlay text precisely."
                        />
                      </div> */}
                      {/* <div>
                        <SecureInstructorInput
                          label="Issuer Title"
                          placeholder="Chief Executive Officer"
                          value={courseLandingFormData?.certificateIssuer || ""}
                          onChange={(e) => setCourseLandingFormData({
                            ...courseLandingFormData,
                            certificateIssuer: e.target.value,
                          })}
                          maxLength={100}
                        />
                      </div>
                      <div>
                        <SecureInstructorInput
                          label="Issuer Organization"
                          placeholder="BRAVYNEX ENGINEERING"
                          value={courseLandingFormData?.certificateOrganization || ""}
                          onChange={(e) => setCourseLandingFormData({
                            ...courseLandingFormData,
                            certificateOrganization: e.target.value,
                          })}
                          maxLength={100}
                        />
                      </div> */}
                      {/* <div>
                        <SecureInstructorInput
                          label="From (Printed)"
                          placeholder="BRAVYNEX ENGINEERING"
                          value={courseLandingFormData?.certificateFrom || ""}
                          onChange={(e) => setCourseLandingFormData({
                            ...courseLandingFormData,
                            certificateFrom: e.target.value,
                          })}
                          maxLength={100}
                        />
                      </div> */}
                      <div>
                        <SecureInstructorInput
                          label="Default Grade"
                          placeholder="A"
                          value={courseLandingFormData?.defaultCertificateGrade || ""}
                          onChange={(e) => setCourseLandingFormData({
                            ...courseLandingFormData,
                            defaultCertificateGrade: e.target.value,
                          })}
                          maxLength={10}
                          description="Used if your grading logic isn't provided elsewhere."
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-gray-700" />
                  Completion Requirements
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="completionPercentage" className="text-sm font-medium text-gray-700 mb-2 block">
                      Video Completion Percentage (%)
                    </Label>
                    <div className="relative">
                      <Input
                        id="completionPercentage"
                        type="number"
                        placeholder="e.g., 70"
                        value={courseLandingFormData?.completionPercentage || 95}
                        onChange={(e) => setCourseLandingFormData({ 
                          ...courseLandingFormData, 
                          completionPercentage: parseInt(e.target.value) || 95
                        })}
                        className="w-full pl-10"
                        min="1"
                        max="100"
                      />
                      <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Percentage of each video that must be watched to mark as complete (1-100%)
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-gray-700" />
                      <div>
                        <Label className="text-sm font-medium text-gray-900">Sequential Access</Label>
                        <p className="text-xs text-gray-500">Students must complete videos in order</p>
                      </div>
                    </div>
                    <Switch
                      id="sequentialAccess"
                      checked={courseLandingFormData?.sequentialAccess !== false}
                      onCheckedChange={(v) => setCourseLandingFormData({ 
                        ...courseLandingFormData, 
                        sequentialAccess: v 
                      })}
                    />
                  </div>

                  {/* <div>
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
                  </div> */}
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
