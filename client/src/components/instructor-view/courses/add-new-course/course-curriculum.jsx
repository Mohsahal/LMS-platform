
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
  mediaBulkUploadService,
  mediaDeleteService,
  mediaUploadService,
} from "@/services";
import { Upload, Trash2, Video, ArrowLeft } from "lucide-react"; // Added ArrowLeft icon
import { useContext, useRef, useLayoutEffect } from "react";
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

  // GSAP animation for new lecture items
  useLayoutEffect(() => {
    lectureRefs.current.forEach((el, index) => {
      if (el) {
        gsap.fromTo(
          el,
          { opacity: 0, y: 30, scale: 0.95 }, // More pronounced entry animation
          { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out", delay: index * 0.1 }
        );
      }
    });
  }, [courseCurriculumFormData]);

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
      const videoFormData = new FormData();
      videoFormData.append("file", selectedFile);

      try {
        setMediaUploadProgress(true);
        const response = await mediaUploadService(
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
        }
      } catch (error) {
        console.log(error);
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
      return Object.entries(obj).every(([key, value]) => {
        if (typeof value === "boolean") {
          return true;
        }
        return value === "";
      });
    });
  }

  async function handleMediaBulkUpload(event) {
    const selectedFiles = Array.from(event.target.files);
    const bulkFormData = new FormData();

    selectedFiles.forEach((fileItem) => bulkFormData.append("files", fileItem));

    try {
      setMediaUploadProgress(true);
      const response = await mediaBulkUploadService(
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
          ...response?.data.map((item, index) => ({
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
      }
    } catch (e) {
      console.log(e);
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
    <Card className="shadow-lg rounded-xl overflow-hidden"> {/* Enhanced card styling */}
      <CardHeader className="flex flex-row items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
        <CardTitle className="text-2xl font-bold text-gray-800">Create Course Curriculum</CardTitle>
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
            // Changed from as="label" and htmlFor to onClick
            onClick={handleOpenBulkUploadDialog}
            variant="outline"
            className="cursor-pointer flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50 transition-colors duration-200"
          >
            <Upload className="h-5 w-5" />
            Bulk Upload
          </Button>
          <Button
            disabled={!isCourseCurriculumFormDataValid() || mediaUploadProgress}
            onClick={handleNewLecture}
            className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 flex items-center gap-2"
          >
            <Video className="h-5 w-5" />
            Add Lecture
          </Button>
          <Button
            onClick={() => navigate(-1)} // Back button functionality
            variant="outline"
            className="flex items-center gap-2 text-gray-600 border-gray-300 hover:bg-gray-100 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
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
