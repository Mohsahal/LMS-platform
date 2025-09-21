


import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import VideoPlayer from "@/components/video-player";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  getCurrentCourseProgressService,
  markLectureAsViewedService,
  resetCourseProgressService,
  downloadCertificateService,
} from "@/services";
import { Check, ChevronLeft, ChevronRight, Play, Award, Download, Lock } from "lucide-react";
import { useContext, useEffect, useState, useCallback } from "react";
import Confetti from "react-confetti";
import { useNavigate, useParams } from "react-router-dom";

function StudentViewCourseProgressPage() {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const { studentCurrentCourseProgress, setStudentCurrentCourseProgress } =
    useContext(StudentContext);
  const [lockCourse, setLockCourse] = useState(false);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [showCourseCompleteDialog, setShowCourseCompleteDialog] =
    useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);
  const [isCourseCompleted, setIsCourseCompleted] = useState(false);
  const [showCertificateSidebar, setShowCertificateSidebar] = useState(false);
  const [showVideoCompleteNotification, setShowVideoCompleteNotification] = useState(false);
  const [completedVideoTitle, setCompletedVideoTitle] = useState("");
  const { id } = useParams();


  const fetchCurrentCourseProgress = useCallback(async () => {
    const response = await getCurrentCourseProgressService(auth?.user?._id, id);
    if (response?.success) {
      if (!response?.data?.isPurchased) {
        setLockCourse(true);
      } else {
        setStudentCurrentCourseProgress({
          courseDetails: response?.data?.courseDetails,
          progress: response?.data?.progress,
          completed: response?.data?.completed,
          completionDate: response?.data?.completionDate,
        });

        // Check if course is completed
        if (response?.data?.completed) {
          setIsCourseCompleted(true);
          setShowCourseCompleteDialog(true);
          setShowConfetti(true);
          // Set to first lecture for completed course
          setCurrentLecture(response?.data?.courseDetails?.curriculum[0]);
          return;
        }

        // For incomplete courses, find the next lecture to watch
        const courseDetails = response?.data?.courseDetails;
        const sequentialAccess = courseDetails?.sequentialAccess !== false; // Default to true

        if (response?.data?.progress?.length === 0) {
          // Start with first lecture
          setCurrentLecture(courseDetails?.curriculum[0]);
        } else {
          if (sequentialAccess) {
            // Sequential access: find first incomplete lecture
            const firstIncompleteIndex = courseDetails?.curriculum.findIndex(lecture => {
              const progressEntry = response?.data?.progress.find(p => p.lectureId === lecture._id);
              return !progressEntry || !progressEntry.viewed;
            });
            
            if (firstIncompleteIndex !== -1) {
              setCurrentLecture(courseDetails?.curriculum[firstIncompleteIndex]);
            } else {
              // All lectures completed
              setCurrentLecture(courseDetails?.curriculum[0]);
            }
          } else {
            // Non-sequential: allow access to any lecture
          const lastIndexOfViewedAsTrue = response?.data?.progress.reduceRight(
            (acc, obj, index) => {
              return acc === -1 && obj.viewed ? index : acc;
            },
            -1
          );

            const nextLectureIndex = lastIndexOfViewedAsTrue + 1;
            if (nextLectureIndex < courseDetails?.curriculum?.length) {
              setCurrentLecture(courseDetails?.curriculum[nextLectureIndex]);
            } else {
              setCurrentLecture(courseDetails?.curriculum[0]);
            }
          }
        }
      }
    }
  }, [auth?.user?._id, id, setStudentCurrentCourseProgress]);

  const markLectureAsViewed = useCallback(async (lectureId) => {
    try {
      const response = await markLectureAsViewedService(
        auth?.user?._id,
        studentCurrentCourseProgress?.courseDetails?._id,
        lectureId
      );

      if (response?.success) {
        // Update the progress state
        setStudentCurrentCourseProgress(prev => ({
          ...prev,
          progress: response.data.lecturesProgress,
          completed: response.data.completed,
          completionDate: response.data.completionDate
        }));

        // Check if course is completed
        if (response.data.completed && !isCourseCompleted) {
          console.log('Course completed! Setting completion state...');
          setIsCourseCompleted(true);
          setShowCourseCompleteDialog(true);
          setShowConfetti(true);
        }
      }
    } catch (error) {
      console.error('Error marking lecture as viewed:', error);
    }
  }, [auth?.user?._id, studentCurrentCourseProgress?.courseDetails?._id, setStudentCurrentCourseProgress, isCourseCompleted]);

  const handleVideoEnded = useCallback(async () => {
    console.log("Video ended, checking for next lecture");
    
    if (!currentLecture || !studentCurrentCourseProgress?.courseDetails?.curriculum) {
      return;
    }

    const currentIndex = studentCurrentCourseProgress.courseDetails.curriculum.findIndex(
      lecture => lecture._id === currentLecture._id
    );

    if (currentIndex === -1) {
      return;
    }

    // Show completion notification for current video
    setCompletedVideoTitle(currentLecture.title);
    setShowVideoCompleteNotification(true);

    // Mark current lecture as viewed first
    await markLectureAsViewed(currentLecture._id);

    // Check if there's a next lecture
    const nextIndex = currentIndex + 1;
    if (nextIndex < studentCurrentCourseProgress.courseDetails.curriculum.length) {
      // Move to next lecture after a short delay
      setTimeout(() => {
        const nextLecture = studentCurrentCourseProgress.courseDetails.curriculum[nextIndex];
        console.log("Moving to next lecture:", nextLecture.title);
        setCurrentLecture(nextLecture);
        setShowVideoCompleteNotification(false);
      }, 2000); // 2 second delay to show completion notification
    } else {
      // This was the last lecture - show final completion
      setTimeout(() => {
        console.log("All lectures completed! Showing completion dialog");
        setShowVideoCompleteNotification(false);
        setIsCourseCompleted(true);
        setShowCourseCompleteDialog(true);
        setShowConfetti(true);
      }, 2000); // 2 second delay to show completion notification
    }
  }, [currentLecture, studentCurrentCourseProgress, markLectureAsViewed]);



  async function handleRewatchCourse() {
    const response = await resetCourseProgressService(
      auth?.user?._id,
      studentCurrentCourseProgress?.courseDetails?._id
    );

    if (response?.success) {
      setCurrentLecture(null);
      setShowConfetti(false);
      setShowCourseCompleteDialog(false);
      setIsCourseCompleted(false);
      setShowCertificateSidebar(false);
      fetchCurrentCourseProgress();
    }
  }

  async function handleDownloadCertificate() {
    try {
      console.log('Attempting to download certificate...');
      console.log('User ID:', auth?.user?._id);
      console.log('Course ID:', studentCurrentCourseProgress?.courseDetails?._id);
      console.log('Course completed status:', isCourseCompleted);
      
      if (!isCourseCompleted) {
        alert('Course must be completed before downloading certificate.');
        return;
      }
      
      const res = await downloadCertificateService(
        auth?.user?._id,
        studentCurrentCourseProgress?.courseDetails?._id
      );
      
      console.log('Certificate download response:', res);
      
      if (res.status === 200) {
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificate_${
        auth?.user?.userName || "student"
      }_${
        studentCurrentCourseProgress?.courseDetails?.title || "course"
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      } else {
        console.error('Certificate download failed with status:', res.status);
        alert('Failed to download certificate. Please try again.');
      }
    } catch (e) {
      console.error('Certificate download error:', e);
      if (e.response?.status === 400) {
        const errorMessage = e.response?.data?.message || 'Certificate is only available after course completion.';
        alert(errorMessage);
      } else {
        alert('Failed to download certificate. Please try again.');
      }
    }
  }

  useEffect(() => {
    fetchCurrentCourseProgress();
  }, [id, fetchCurrentCourseProgress]);


  useEffect(() => {
    if (showConfetti) setTimeout(() => setShowConfetti(false), 15000);
  }, [showConfetti]);



  return (
    <div className="flex flex-col h-screen bg-[#1c1d1f] text-white">
      {showConfetti && <Confetti />}
      
      {/* Video Completion Notification */}
      {showVideoCompleteNotification && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-green-600 text-white p-6 rounded-lg shadow-2xl border-2 border-green-400 animate-pulse">
          <div className="flex items-center space-x-3">
            <Check className="h-8 w-8 text-green-200" />
            <div>
              <h3 className="text-lg font-bold">Video Completed!</h3>
              <p className="text-sm text-green-100">{completedVideoTitle}</p>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between p-4 bg-[#1c1d1f] border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate("/student-courses")}
            className="text-white"
            variant="ghost"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to My Courses Page
          </Button>
          <div>
            <h1 className="text-lg font-bold hidden md:block">
              {studentCurrentCourseProgress?.courseDetails?.title}
            </h1>
            {/* Progress Indicator */}
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-32 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${((studentCurrentCourseProgress?.progress?.filter(p => p.viewed).length || 0) / (studentCurrentCourseProgress?.courseDetails?.curriculum?.length || 1)) * 100}%` 
                  }}
                ></div>
              </div>
              <span className="text-sm text-gray-300">
                {studentCurrentCourseProgress?.progress?.filter(p => p.viewed).length || 0} / {studentCurrentCourseProgress?.courseDetails?.curriculum?.length || 0} completed
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setShowCertificateSidebar(!showCertificateSidebar)}
            className={`${
              isCourseCompleted 
                ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800" 
                : "bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700"
            } text-white`}
            size="sm"
          >
            <Award className="h-4 w-4 mr-2" />
            {isCourseCompleted ? "Certificate Ready" : "Certificate"}
          </Button>
          <Button onClick={() => setIsSideBarOpen(!isSideBarOpen)}>
            {isSideBarOpen ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div
          className={`flex-1 ${
            isSideBarOpen ? "mr-[400px]" : ""
          } transition-all duration-300`}
        >
          <VideoPlayer
            width="100%"
            height="500px"
            url={currentLecture?.videoUrl}
            onVideoEnded={handleVideoEnded}
          />
          <div className="p-6">
            <h2 className="text-3xl font-bold mb-4">
              {currentLecture?.title || "Select a Lecture"}
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              {currentLecture?.description}
            </p>
            
          </div>
        </div>
        <div
          className={`fixed right-0 top-0 h-full bg-[#2d2f31] shadow-lg transform ${
            isSideBarOpen ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 ease-in-out z-20`}
          style={{ width: "400px" }}
        >
          <ScrollArea className="h-full p-4">
            <div className="flex items-center justify-between mb-6">
              <div>
              <h3 className="text-xl font-semibold">Course Content</h3>
                {isCourseCompleted && (
                  <p className="text-sm text-green-400 flex items-center mt-1">
                    <Award className="h-4 w-4 mr-1" />
                    Course Completed
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSideBarOpen(false)}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            {studentCurrentCourseProgress?.courseDetails?.curriculum?.map(
              (lecture, index) => {
                const isCompleted = studentCurrentCourseProgress?.progress?.some(
                  (p) => p.lectureId === lecture._id && p.viewed
                );
                const isCurrentLecture = currentLecture?._id === lecture._id;
                const sequentialAccess = studentCurrentCourseProgress?.courseDetails?.sequentialAccess !== false;
                
                // Check if lecture is accessible (for sequential access)
                const isAccessible = !sequentialAccess || index === 0 || 
                  studentCurrentCourseProgress?.courseDetails?.curriculum?.slice(0, index).every((prevLecture) => {
                    return studentCurrentCourseProgress?.progress?.some(
                      (p) => p.lectureId === prevLecture._id && p.viewed
                    );
                  });

                return (
                <div
                  key={lecture._id}
                    className={`flex items-center p-3 mb-3 rounded-lg transition-all duration-200 ${
                      isCurrentLecture
                      ? "bg-blue-600 shadow-md"
                        : isAccessible
                        ? "bg-gray-700 hover:bg-gray-600 cursor-pointer"
                        : "bg-gray-800 opacity-60 cursor-not-allowed"
                  }`}
                    onClick={() => isAccessible && setCurrentLecture(lecture)}
                >
                  <div className="flex-shrink-0 mr-3">
                      {isCompleted ? (
                        <Check className="h-5 w-5 text-green-400" />
                      ) : isAccessible ? (
                        <Play className="h-5 w-5 text-gray-400" />
                    ) : (
                        <Lock className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <p
                      className={`font-medium ${
                          isCurrentLecture
                          ? "text-white"
                            : isAccessible
                            ? "text-gray-100"
                            : "text-gray-500"
                      }`}
                    >
                      {lecture.title}
                    </p>
                    <p
                      className={`text-sm ${
                          isCurrentLecture
                          ? "text-blue-200"
                            : isCompleted
                            ? "text-green-300"
                            : isAccessible
                            ? "text-gray-300"
                            : "text-gray-500"
                      }`}
                    >
                      {isCompleted ? "Completed" : isCurrentLecture ? "▶️ Playing" : `Lecture ${index + 1}`}
                        {!isAccessible && sequentialAccess && (
                          <span className="ml-2 text-xs text-red-400">(Locked)</span>
                        )}
                    </p>
                  </div>
                  {lecture.freePreview && (
                    <span className="ml-auto px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-200 rounded-full">
                      Free
                    </span>
                  )}
                </div>
                );
              }
            )}
          </ScrollArea>
        </div>

        {/* Certificate Sidebar */}
        <div
          className={`fixed right-0 top-0 h-full bg-[#2d2f31] shadow-lg transform ${
            showCertificateSidebar ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 ease-in-out z-30`}
          style={{ width: "400px" }}
        >
          <ScrollArea className="h-full p-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Your Certificate</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCertificateSidebar(false)}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <div className="text-center">
              {isCourseCompleted ? (
                <>
                  <Award className="h-24 w-24 text-yellow-400 mx-auto mb-6" />
                  <p className="text-lg mb-4 text-green-400">
                    🎉 Congratulations! You have completed the course.
                  </p>
                  <div className="mb-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <p className="text-sm text-green-300">
                      Completed on: {studentCurrentCourseProgress?.completionDate ? 
                        new Date(studentCurrentCourseProgress.completionDate).toLocaleDateString() : 
                        'Recently'}
                    </p>
                  </div>
                  
                  {studentCurrentCourseProgress?.courseDetails?.certificateEnabled ? (
                    <Button
                      onClick={handleDownloadCertificate}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center w-full mb-3"
                    >
                      <Download className="h-5 w-5 mr-2" /> Download Certificate
                    </Button>
                  ) : (
                    <div className="mb-3 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                      <p className="text-sm text-yellow-300">
                        Certificate generation is disabled for this course
                      </p>
                    </div>
                  )}
                  
                  <Button
                    onClick={handleRewatchCourse}
                    variant="outline"
                    className="w-full text-blue-400 border-blue-400 hover:bg-blue-900"
                  >
                    <Play className="h-4 w-4 mr-2" /> Rewatch Course
                  </Button>
                </>
              ) : (
                <>
                  <Lock className="h-24 w-24 text-gray-400 mx-auto mb-6" />
                  <p className="text-lg text-gray-300 mb-4">
                    Complete all lectures to unlock your certificate.
                  </p>
                  <div className="p-3 bg-gray-700 rounded-lg mb-4">
                    <p className="text-sm text-gray-300">
                      Progress: {studentCurrentCourseProgress?.progress?.filter(p => p.viewed).length || 0} / {studentCurrentCourseProgress?.courseDetails?.curriculum?.length || 0} lectures completed
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Watch each video completely to advance to the next one
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="mt-8 p-4 bg-gray-700 rounded-lg">
              <h4 className="text-lg font-semibold mb-2">Course Completion</h4>
              <p className="text-gray-300 mb-4">
                To receive your certificate, ensure all lectures are marked as
                viewed. Your progress is automatically saved.
              </p>
              <Button
                onClick={handleRewatchCourse}
                variant="outline"
                className="w-full text-blue-400 border-blue-400 hover:bg-blue-900"
              >
                Reset Course Progress
              </Button>
            </div>
          </ScrollArea>
        </div>

        {/* Course Locked Dialog */}
        <Dialog open={lockCourse}>
          <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white p-6 rounded-lg shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-red-500">
                Course Not Purchased
              </DialogTitle>
              <DialogDescription className="text-gray-300 mt-2">
                It looks like you haven&apos;t purchased this course yet. Please
                purchase the course to access its content.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => navigate("/student-courses")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Go to Courses
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Course Complete Dialog */}
        <Dialog open={showCourseCompleteDialog} onOpenChange={setShowCourseCompleteDialog}>
          <DialogContent className="sm:max-w-[500px] bg-white text-gray-900 p-6 rounded-lg shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-green-600 flex items-center">
                <Award className="h-6 w-6 mr-2" />
                Course Completed!
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">
                Congratulations! You have successfully completed all lectures. 
                Your certificate is now available for download.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6 flex flex-col space-y-3">
              {studentCurrentCourseProgress?.courseDetails?.certificateEnabled ? (
                <Button
                  onClick={handleDownloadCertificate}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center py-3"
                >
                  <Download className="h-5 w-5 mr-2" /> Download Certificate
                </Button>
              ) : (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 text-center">
                    Certificate generation is disabled for this course
                  </p>
                </div>
              )}
              <Button
                onClick={handleRewatchCourse}
                variant="outline"
                className="text-blue-600 border-blue-600 hover:bg-blue-50 py-3"
              >
                <Play className="h-4 w-4 mr-2" /> Rewatch Course
              </Button>
              <Button
                onClick={() => {
                  setShowCourseCompleteDialog(false);
                  setShowConfetti(false);
                }}
                variant="ghost"
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                Continue Learning
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default StudentViewCourseProgressPage;