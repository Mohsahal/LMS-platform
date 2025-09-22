
import MediaProgressbar from "@/components/media-progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import VideoPlayer from "@/components/video-player";
import { courseCurriculumInitialFormData } from "@/config";
import { InstructorContext } from "@/context/instructor-context";
import {
  mediaDeleteService,
} from "@/services";
import uploadService from "@/services/uploadService";
import { Upload, Trash2, Video, ArrowLeft } from "lucide-react"; // Added ArrowLeft icon
import { useContext, useRef, useLayoutEffect, useState } from "react";
import gsap from "gsap";
import { useNavigate } from "react-router-dom"; // Imported useNavigate

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
  const lectureRefs = useRef([]);
  const navigate = useNavigate(); // Initialized useNavigate

  // Refs for GSAP animations
  const cardRef = useRef(null);
  const titleRef = useRef(null);
  const bulkUploadBtnRef = useRef(null);
  const addLectureBtnRef = useRef(null);

  // GSAP animation for initial load and new lecture items
  const [previousLength, setPreviousLength] = useState(0);
  
  useLayoutEffect(() => {
    // Initial card and header animation
    gsap.fromTo(cardRef.current, 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
    );
    gsap.fromTo(titleRef.current, 
      { opacity: 0, x: -20 }, 
      { opacity: 1, x: 0, duration: 0.6, ease: "power3.out", delay: 0.2 }
    );
    gsap.fromTo(bulkUploadBtnRef.current, 
      { opacity: 0, x: 20 }, 
      { opacity: 1, x: 0, duration: 0.6, ease: "power3.out", delay: 0.3 }
    );
    gsap.fromTo(addLectureBtnRef.current, 
      { opacity: 0, x: 20 }, 
      { opacity: 1, x: 0, duration: 0.6, ease: "power3.out", delay: 0.4 }
    );

    const currentLength = courseCurriculumFormData.length;
    
    // Only animate if new items were added (not when searching/filtering)
    if (currentLength > previousLength) {
      const newItems = lectureRefs.current.slice(previousLength);
      newItems.forEach((el, index) => {
        if (el) {
          gsap.fromTo(
            el,
            { opacity: 0, y: 30, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power2.out", delay: index * 0.05 + 0.5 } // Added delay for sequential appearance
          );
        }
      });
    }
    
    setPreviousLength(currentLength);
  }, [courseCurriculumFormData.length]); // Added courseCurriculumFormData.length to dependency array

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

  function handleFreePreviewChange(currentValue, currentIndex) {
    let cpyCourseCurriculumFormData = [...courseCurriculumFormData];
    cpyCourseCurriculumFormData[currentIndex] = {
      ...cpyCourseCurriculumFormData[currentIndex],
      freePreview: currentValue,
    };

    setCourseCurriculumFormData(cpyCourseCurriculumFormData);
  }

  async function handleSingleLectureUpload(event, currentIndex) {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      // Validate file size (2GB limit)
      const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
      if (selectedFile.size > maxSize) {
        alert(`File size exceeds 2GB limit. Please choose a smaller file.`);
        return;
      }

      // Validate file type
      if (!selectedFile.type.startsWith('video/')) {
        alert('Please select a valid video file.');
        return;
      }

      const videoFormData = new FormData();
      videoFormData.append("file", selectedFile);

      try {
        setMediaUploadProgress(true);
        setMediaUploadProgressPercentage(0);
        
        // Use enhanced upload service with better error handling
        const response = await uploadService.uploadFile(
          videoFormData,
          setMediaUploadProgressPercentage
        );
        
        if (response.success) {
          let cpyCourseCurriculumFormData = [...courseCurriculumFormData];
          cpyCourseCurriculumFormData[currentIndex] = {
            ...cpyCourseCurriculumFormData[currentIndex],
            videoUrl: response?.data?.url,
            public_id: response?.data?.public_id,
          };
          setCourseCurriculumFormData(cpyCourseCurriculumFormData);
          setMediaUploadProgress(false);
          setMediaUploadProgressPercentage(0);
        } else {
          alert('Upload failed. Please try again.');
        }
      } catch (error) {
        console.log('Upload error:', error);
        if (error?.message?.includes('token')) {
          alert('Authentication issue. Please refresh the page and try again.');
        } else if (error?.code === 'ECONNABORTED') {
          alert('Upload timeout. Please try again with a smaller file or check your internet connection.');
        } else {
          alert(`Upload failed: ${error?.message || 'Please try again.'}`);
        }
      } finally {
        setMediaUploadProgress(false);
        setMediaUploadProgressPercentage(0);
        // Reset the file input
        event.target.value = '';
      }
    }
  }

  async function handleReplaceVideo(currentIndex) {
    let cpyCourseCurriculumFormData = [...courseCurriculumFormData];
    const getCurrentVideoPublicId =
      cpyCourseCurriculumFormData[currentIndex].public_id;

    const deleteCurrentMediaResponse = await mediaDeleteService(
      getCurrentVideoPublicId
    );

    if (deleteCurrentMediaResponse?.success) {
      cpyCourseCurriculumFormData[currentIndex] = {
        ...cpyCourseCurriculumFormData[currentIndex],
        videoUrl: "",
        public_id: "",
      };

      setCourseCurriculumFormData(cpyCourseCurriculumFormData);
    }
  }

  function isCourseCurriculumFormDataValid() {
    return courseCurriculumFormData.every((item) => {
      return (
        item &&
        typeof item === "object" &&
        item.title.trim() !== "" &&
        item.videoUrl.trim() !== ""
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

  async function handleMediaBulkUpload(event) {
    const selectedFiles = Array.from(event.target.files);
    
    // Validate files before upload
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB per file
    const invalidFiles = selectedFiles.filter(file => 
      file.size > maxSize || !file.type.startsWith('video/')
    );
    
    if (invalidFiles.length > 0) {
      alert(`Some files are invalid. Please ensure all files are videos under 2GB.`);
      return;
    }

    const bulkFormData = new FormData();
    selectedFiles.forEach((fileItem) => bulkFormData.append("files", fileItem));

    try {
      setMediaUploadProgress(true);
      setMediaUploadProgressPercentage(0);
      
      // Use enhanced upload service for bulk uploads
      const response = await uploadService.uploadBulkFiles(
        bulkFormData,
        setMediaUploadProgressPercentage
      );

      console.log(response, "bulk");
      if (response?.success) {
        let cpyCourseCurriculumFormdata =
          areAllCourseCurriculumFormDataObjectsEmpty(courseCurriculumFormData)
            ? []
            : [...courseCurriculumFormData];

        cpyCourseCurriculumFormdata = [
          ...cpyCourseCurriculumFormdata,
          ...(response?.data || []).map((item, index) => ({
            videoUrl: item?.url,
            public_id: item?.public_id,
            title: `Lecture ${
              cpyCourseCurriculumFormdata.length + (index + 1)
            }`,
            freePreview: false,
          })),
        ];
        setCourseCurriculumFormData(cpyCourseCurriculumFormdata);
        setMediaUploadProgress(false);
        setMediaUploadProgressPercentage(0);
      } else {
        alert('Bulk upload failed. Please try again.');
      }
    } catch (error) {
      console.log('Bulk upload error:', error);
      if (error?.message?.includes('token')) {
        alert('Authentication issue. Please refresh the page and try again.');
      } else if (error?.code === 'ECONNABORTED') {
        alert('Upload timeout. Please try again with smaller files or check your internet connection.');
      } else {
        alert(`Bulk upload failed: ${error?.message || 'Please try again.'}`);
      }
    } finally {
      setMediaUploadProgress(false);
      setMediaUploadProgressPercentage(0);
      // Reset the file input
      event.target.value = '';
    }
  }

  async function handleDeleteLecture(currentIndex) {
    const lectureToDelete = lectureRefs.current[currentIndex];
    if (lectureToDelete) {
      await gsap.to(lectureToDelete, {
        opacity: 0,
        x: -50, // Slide out to the left
        duration: 0.4,
        ease: "power3.in",
        onComplete: async () => {
          let cpyCourseCurriculumFormData = [...courseCurriculumFormData];
          const getCurrentSelectedVideoPublicId =
            cpyCourseCurriculumFormData[currentIndex].public_id;

          const response = await mediaDeleteService(getCurrentSelectedVideoPublicId);

          if (response?.success) {
            cpyCourseCurriculumFormData = cpyCourseCurriculumFormData.filter(
              (_, index) => index !== currentIndex
            );

            setCourseCurriculumFormData(cpyCourseCurriculumFormData);
          }
        },
      });
    }
  }

  return (
    
    <Card ref={cardRef} className="shadow-lg rounded-xl overflow-hidden"> {/* Enhanced card styling */}
    
      <CardHeader className="flex flex-row items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3"> {/* Added a div to group back button and title */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <CardTitle ref={titleRef} className="text-2xl font-bold text-gray-800">Create Course Curriculum</CardTitle>
        </div>
        <div className="flex space-x-3">
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
            ref={bulkUploadBtnRef} // Added ref
            // Changed from as="label" and htmlFor to onClick
            onClick={handleOpenBulkUploadDialog}
            variant="outline"
            className="cursor-pointer flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50 transition-colors duration-200"
          >
            <Upload className="h-5 w-5" />
            Bulk Upload
          </Button>
          <Button
            ref={addLectureBtnRef} // Added ref
            disabled={!isCourseCurriculumFormDataValid() || mediaUploadProgress}
            onClick={handleNewLecture}
            className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 flex items-center gap-2"
          >
            <Video className="h-5 w-5" />
            Add Lecture
          </Button>
         
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {mediaUploadProgress ? (
          <MediaProgressbar
            isMediaUploading={mediaUploadProgress}
            progress={mediaUploadProgressPercentage}
          />
        ) : null}
        <div className="mt-6 space-y-4">
          {courseCurriculumFormData.map((curriculumItem, index) => (
            <div
              key={index}
              ref={(el) => (lectureRefs.current[index] = el)}
              className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-all duration-200 ease-in-out" // Enhanced lecture item styling
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h3 className="font-semibold text-lg text-gray-700 min-w-[100px]">Lecture {index + 1}</h3>
                <Input
                  name={`title-${index + 1}`}
                  placeholder="Enter lecture title"
                  className="flex-grow max-w-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  onChange={(event) => handleCourseTitleChange(event, index)}
                  value={courseCurriculumFormData[index]?.title}
                />
                <div className="flex items-center space-x-2 ml-auto">
                  <Switch
                    onCheckedChange={(value) =>
                      handleFreePreviewChange(value, index)
                    }
                    checked={courseCurriculumFormData[index]?.freePreview}
                    id={`freePreview-${index + 1}`}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <Label htmlFor={`freePreview-${index + 1}`} className="text-gray-600">
                    Free Preview
                  </Label>
                </div>
              </div>
              <div className="mt-4">
                {courseCurriculumFormData[index]?.videoUrl ? (
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <VideoPlayer
                      url={courseCurriculumFormData[index]?.videoUrl}
                      width="450px"
                      height="200px"
                    />
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => handleReplaceVideo(index)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white transition-colors duration-200 flex items-center gap-2"
                      >
                        Replace Video
                      </Button>
                      <Button
                        onClick={() => handleDeleteLecture(index)}
                        className="bg-red-600 hover:bg-red-700 text-white transition-colors duration-200 flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Lecture
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 border border-dashed border-gray-300 rounded-md bg-gray-50">
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(event) =>
                        handleSingleLectureUpload(event, index)
                      }
                      className="flex-grow border-none shadow-none file:text-blue-600 file:bg-transparent file:border-none file:hover:bg-blue-50 file:transition-colors file:duration-200"
                    />
                    <span className="text-gray-500 text-sm">Upload a video for this lecture</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default CourseCurriculum;
