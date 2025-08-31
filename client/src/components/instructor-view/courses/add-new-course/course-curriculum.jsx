import MediaProgressbar from "@/components/media-progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import VideoPlayer from "@/components/video-player";
import { courseCurriculumInitialFormData } from "@/config";
import { InstructorContext } from "@/context/instructor-context";
import {
  mediaBulkUploadService,
  mediaDeleteService,
  mediaUploadService,
} from "@/services";
import { Upload, Plus, Play, Trash2, Edit3, Clock, FileText, Eye, AlertCircle } from "lucide-react";
import { useContext, useRef, useState } from "react";

function CourseCurriculum() {
  const {
    courseCurriculumFormData,
    setCourseCurriculumFormData,
    mediaUploadProgress,
    setMediaUploadProgress,
    mediaUploadProgressPercentage,
    setMediaUploadProgressPercentage,
  } = useContext(InstructorContext);

  const bulkUploadInputRef = useRef(null);
  const [uploadingFiles, setUploadingFiles] = useState(new Set());
  const [uploadErrors, setUploadErrors] = useState({});

  function handleNewLecture() {
    setCourseCurriculumFormData([
      ...courseCurriculumFormData,
      {
        ...courseCurriculumInitialFormData[0],
      },
    ]);
  }

  function handleCourseTitleChange(event, currentIndex) {
    let cpyCourseCurriculumFormData = [...courseCurriculumFormData];
    cpyCourseCurriculumFormData[currentIndex] = {
      ...cpyCourseCurriculumFormData[currentIndex],
      title: event.target.value,
    };

    setCourseCurriculumFormData(cpyCourseCurriculumFormData);
  }

  function handleLectureDurationChange(event, currentIndex) {
    let cpy = [...courseCurriculumFormData];
    cpy[currentIndex] = { ...cpy[currentIndex], duration: event.target.value };
    setCourseCurriculumFormData(cpy);
  }

  function handleLectureResourcesChange(event, currentIndex) {
    let cpy = [...courseCurriculumFormData];
    cpy[currentIndex] = { ...cpy[currentIndex], resources: event.target.value };
    setCourseCurriculumFormData(cpy);
  }

  function handleFreePreviewChange(currentValue, currentIndex) {
    let cpyCourseCurriculumFormData = [...courseCurriculumFormData];
    cpyCourseCurriculumFormData[currentIndex] = {
      ...cpyCourseCurriculumFormData[currentIndex],
      freePreview: currentValue,
    };

    setCourseCurriculumFormData(cpyCourseCurriculumFormData);
  }

  // Enhanced single video upload with better progress tracking
  async function handleSingleLectureUpload(event, currentIndex) {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    // Validate file size (500MB limit)
    const maxSize = 500 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      alert("File size too large. Please select a file smaller than 500MB.");
      return;
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm', 'video/mkv'];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Invalid file type. Please select MP4, MOV, AVI, WebM, or MKV files.");
      return;
    }

    // Add file to uploading set
    setUploadingFiles(prev => new Set(prev).add(currentIndex));
    
    // Clear any previous errors
    setUploadErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[currentIndex];
      return newErrors;
    });

    const videoFormData = new FormData();
    videoFormData.append("file", selectedFile);

    try {
      // Start upload progress
      setMediaUploadProgress(true);
      setMediaUploadProgressPercentage(0);
      
      const response = await mediaUploadService(
        videoFormData,
        (progress) => {
          setMediaUploadProgressPercentage(progress);
        }
      );
      
      if (response.success) {
        let cpyCourseCurriculumFormData = [...courseCurriculumFormData];
        cpyCourseCurriculumFormData[currentIndex] = {
          ...cpyCourseCurriculumFormData[currentIndex],
          videoUrl: response.data?.url || "",
          public_id: response.data?.public_id || "",
        };
        setCourseCurriculumFormData(cpyCourseCurriculumFormData);
        
        // Show completion for 2 seconds
        setTimeout(() => {
          setMediaUploadProgress(false);
        }, 2000);
      } else {
        throw new Error(response.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadErrors(prev => ({
        ...prev,
        [currentIndex]: error.message || "Upload failed"
      }));
    } finally {
      // Remove from uploading set
      setUploadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(currentIndex);
        return newSet;
      });
      
      // Hide progress if no more uploads
      if (uploadingFiles.size === 0) {
        setMediaUploadProgress(false);
      }
    }
  }

  async function handleReplaceVideo(currentIndex) {
    const currentVideo = courseCurriculumFormData[currentIndex];
    if (!currentVideo?.public_id) return;

    try {
      const deleteResponse = await mediaDeleteService(currentVideo.public_id);
      
      if (deleteResponse?.success) {
        let cpyCourseCurriculumFormData = [...courseCurriculumFormData];
        cpyCourseCurriculumFormData[currentIndex] = {
          ...cpyCourseCurriculumFormData[currentIndex],
          videoUrl: "",
          public_id: "",
        };
        setCourseCurriculumFormData(cpyCourseCurriculumFormData);
      } else {
        throw new Error(deleteResponse.message || "Failed to delete video");
      }
    } catch (error) {
      console.error("Replace video error:", error);
      
      // Check if it's an authentication error
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        alert("Authentication error. Please login again.");
      } else if (error.message?.includes('404')) {
        alert("Video not found. It may have been already deleted.");
        // Clear the video anyway
        let cpyCourseCurriculumFormData = [...courseCurriculumFormData];
        cpyCourseCurriculumFormData[currentIndex] = {
          ...cpyCourseCurriculumFormData[currentIndex],
          videoUrl: "",
          public_id: "",
        };
        setCourseCurriculumFormData(cpyCourseCurriculumFormData);
      } else {
        alert(`Failed to replace video: ${error.message || 'Unknown error'}`);
      }
    }
  }

  function isCourseCurriculumFormDataValid() {
    return courseCurriculumFormData.every((item) => {
      return (
        item &&
        typeof item === "object" &&
        item.title?.trim() !== "" &&
        item.videoUrl?.trim() !== ""
      );
    });
  }

  function handleOpenBulkUploadDialog() {
    bulkUploadInputRef.current?.click();
  }

  function areAllCourseCurriculumFormDataObjectsEmpty(arr) {
    return arr.every((obj) => {
      return Object.entries(obj).every(([, value]) => {
        if (typeof value === "boolean") {
          return true;
        }
        return value === "";
      });
    });
  }

  // Enhanced bulk upload with individual file progress
  async function handleMediaBulkUpload(event) {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length === 0) return;

    // Validate all files first
    const maxSize = 500 * 1024 * 1024;
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm', 'video/mkv'];
    
    for (const file of selectedFiles) {
      if (file.size > maxSize) {
        alert(`File "${file.name}" is too large. Please select files smaller than 500MB.`);
        return;
      }
      if (!allowedTypes.includes(file.type)) {
        alert(`File "${file.name}" has an invalid type. Please select MP4, MOV, AVI, WebM, or MKV files.`);
        return;
      }
    }

    // Start bulk upload progress
    setMediaUploadProgress(true);
    setMediaUploadProgressPercentage(0);

    try {
      const bulkFormData = new FormData();
      selectedFiles.forEach((fileItem) => bulkFormData.append("files", fileItem));

      const response = await mediaBulkUploadService(
        bulkFormData,
        (progress) => {
          setMediaUploadProgressPercentage(progress);
        }
      );

      if (response?.success) {
        let cpyCourseCurriculumFormdata =
          areAllCourseCurriculumFormDataObjectsEmpty(courseCurriculumFormData)
            ? []
            : [...courseCurriculumFormData];

        const newLectures = (response.data || []).map((item, index) => ({
          videoUrl: item.url || "",
          public_id: item.public_id || "",
          title: `Lecture ${cpyCourseCurriculumFormdata.length + (index + 1)}`,
          freePreview: false,
          duration: "",
          resources: "",
        }));

        cpyCourseCurriculumFormdata = [...cpyCourseCurriculumFormdata, ...newLectures];
        setCourseCurriculumFormData(cpyCourseCurriculumFormdata);

        // Show success message
        alert(`Successfully uploaded ${selectedFiles.length} video(s)!`);
        
        // Show completion for 3 seconds
        setTimeout(() => {
          setMediaUploadProgress(false);
          setMediaUploadProgressPercentage(0);
        }, 3000);
      } else {
        throw new Error(response.message || "Bulk upload failed");
      }
    } catch (error) {
      console.error("Bulk upload error:", error);
      alert("Bulk upload failed. Please try again.");
      setMediaUploadProgress(false);
    }
  }

  async function handleDeleteLecture(currentIndex) {
    const currentVideo = courseCurriculumFormData[currentIndex];
    if (!currentVideo?.public_id) {
      // If no public_id, just remove from local state
      let cpyCourseCurriculumFormData = courseCurriculumFormData.filter(
        (_, index) => index !== currentIndex
      );
      setCourseCurriculumFormData(cpyCourseCurriculumFormData);
      return;
    }

    try {
      const response = await mediaDeleteService(currentVideo.public_id);
      
      if (response?.success) {
        let cpyCourseCurriculumFormData = courseCurriculumFormData.filter(
          (_, index) => index !== currentIndex
        );
        setCourseCurriculumFormData(cpyCourseCurriculumFormData);
      } else {
        throw new Error(response.message || "Failed to delete video");
      }
    } catch (error) {
      console.error("Delete lecture error:", error);
      
      // Check if it's an authentication error
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        alert("Authentication error. Please login again.");
      } else if (error.message?.includes('404')) {
        alert("Video not found. It may have been already deleted.");
        // Remove from local state anyway
        let cpyCourseCurriculumFormData = courseCurriculumFormData.filter(
          (_, index) => index !== currentIndex
        );
        setCourseCurriculumFormData(cpyCourseCurriculumFormData);
      } else {
        alert(`Failed to delete video: ${error.message || 'Unknown error'}`);
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-100">
          <div className="flex flex-row justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Course Curriculum</CardTitle>
              <p className="text-gray-600 mt-1">Structure your course with engaging lectures and content</p>
            </div>
            <div className="flex gap-3">
              <Input
                type="file"
                ref={bulkUploadInputRef}
                accept="video/*"
                multiple
                className="hidden"
                id="bulk-media-upload"
                onChange={handleMediaBulkUpload}
              />
              <Button
                as="label"
                htmlFor="bulk-media-upload"
                variant="outline"
                className="cursor-pointer border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                onClick={handleOpenBulkUploadDialog}
                disabled={mediaUploadProgress}
              >
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Button
              disabled={!isCourseCurriculumFormDataValid() || mediaUploadProgress}
              onClick={handleNewLecture}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Lecture
            </Button>
            <div className="text-sm text-gray-500">
              {courseCurriculumFormData.length} lecture{courseCurriculumFormData.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Global Upload Progress */}
          {mediaUploadProgress && (
            <MediaProgressbar
              isMediaUploading={mediaUploadProgress}
              progress={mediaUploadProgressPercentage}
            />
          )}

          <div className="space-y-6">
            {courseCurriculumFormData.map((curriculumItem, index) => (
              <Card key={`lecture-${index}`} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  {/* Lecture Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Play className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Lecture {index + 1}</h3>
                      {uploadingFiles.has(index) && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm">Uploading...</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          onCheckedChange={(value) =>
                            handleFreePreviewChange(value, index)
                          }
                          checked={curriculumItem ? curriculumItem.freePreview : false}
                          id={`freePreview-${index + 1}`}
                        />
                        <Label htmlFor={`freePreview-${index + 1}`} className="text-sm font-medium text-gray-700">
                          Free Preview
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Lecture Details Form */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Lecture Title</Label>
                      <Input
                        name={`title-${index + 1}`}
                        placeholder="Enter engaging lecture title"
                        className="w-full"
                        onChange={(event) => handleCourseTitleChange(event, index)}
                        value={curriculumItem?.title || ""}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Duration</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="08:30"
                          value={curriculumItem?.duration || ""}
                          onChange={(e) => handleLectureDurationChange(e, index)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Resources</Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Textarea
                          placeholder="Links, notes, downloads..."
                          value={curriculumItem?.resources || ""}
                          onChange={(e) => handleLectureResourcesChange(e, index)}
                          className="pl-10 min-h-[40px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Video Section */}
                  <div className="border-t border-gray-100 pt-6">
                    {curriculumItem?.videoUrl ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Eye className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">Video uploaded successfully</span>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <VideoPlayer
                            url={curriculumItem.videoUrl}
                            width="100%"
                            height="250px"
                          />
                          <div className="space-y-3">
                            <Button 
                              onClick={() => handleReplaceVideo(index)}
                              variant="outline"
                              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                              disabled={uploadingFiles.has(index)}
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Replace Video
                            </Button>
                            <Button
                              onClick={() => handleDeleteLecture(index)}
                              variant="outline"
                              className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                              disabled={uploadingFiles.has(index)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Lecture
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Upload Error Display */}
                        {uploadErrors[index] && (
                          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <span className="text-sm text-red-600">{uploadErrors[index]}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setUploadErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors[index];
                                return newErrors;
                              })}
                              className="text-red-600 hover:text-red-700"
                            >
                              ×
                            </Button>
                          </div>
                        )}

                        {/* Upload Area */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors duration-200">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Lecture Video</h4>
                          <p className="text-gray-600 mb-4">Support MP4, MOV, AVI, WebM, MKV formats up to 500MB</p>
                          <Input
                            type="file"
                            accept="video/*"
                            onChange={(event) => handleSingleLectureUpload(event, index)}
                            className="max-w-xs mx-auto"
                            disabled={uploadingFiles.has(index)}
                          />
                          {uploadingFiles.has(index) && (
                            <p className="text-sm text-blue-600 mt-2">Uploading video...</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CourseCurriculum;
