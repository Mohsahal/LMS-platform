


import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useContext, useEffect, useState, useCallback, useRef } from "react";
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
  const { id } = useParams();

  const viewedLecturesRef = useRef({}); // New: Initialize useRef to track viewed lectures

  const fetchCurrentCourseProgress = useCallback(async () => {
    const response = await getCurrentCourseProgressService(auth?.user?._id, id);
    if (response?.success) {
      if (!response?.data?.isPurchased) {
        setLockCourse(true);
      } else {
        setStudentCurrentCourseProgress({
          courseDetails: response?.data?.courseDetails,
          progress: response?.data?.progress,
        });

        if (response?.data?.completed) {
          setCurrentLecture(response?.data?.courseDetails?.curriculum[0]);
          setShowCourseCompleteDialog(true);
          setShowConfetti(true);
          setIsCourseCompleted(true);

          return;
        }

        if (response?.data?.progress?.length === 0) {
          setCurrentLecture(response?.data?.courseDetails?.curriculum[0]);
        } else {
          console.log("logging here");
          const lastIndexOfViewedAsTrue = response?.data?.progress.reduceRight(
            (acc, obj, index) => {
              return acc === -1 && obj.viewed ? index : acc;
            },
            -1
          );

          setCurrentLecture(
            response?.data?.courseDetails?.curriculum[
              lastIndexOfViewedAsTrue + 1
            ]
          );
        }
      }
    }
  }, [auth?.user?._id, id, setStudentCurrentCourseProgress]);

  const updateCourseProgress = useCallback(async () => {
    if (currentLecture) {
      const response = await markLectureAsViewedService(
        auth?.user?._id,
        studentCurrentCourseProgress?.courseDetails?._id,
        currentLecture._id
      );

      if (response?.success) {
        fetchCurrentCourseProgress();
      }
    }
  }, [currentLecture, auth?.user?._id, studentCurrentCourseProgress?.courseDetails?._id, fetchCurrentCourseProgress]);

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
      fetchCurrentCourseProgress();
    }
  }

  async function handleDownloadCertificate() {
    try {
      const res = await downloadCertificateService(
        auth?.user?._id,
        studentCurrentCourseProgress?.courseDetails?._id
      );
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
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    fetchCurrentCourseProgress();
  }, [id, fetchCurrentCourseProgress]);

  useEffect(() => {
    // Only proceed if currentLecture is defined and has reached the end
    if (!currentLecture || currentLecture.progressValue !== 1) {
      return;
    }

    const lectureId = currentLecture._id;

    // Check if this lecture has already been marked as viewed in the current session
    // or if the update process has already been initiated for this lecture
    if (viewedLecturesRef.current[lectureId]) {
      return;
    }

    // Check if this specific lecture has already been marked as viewed in the actual progress data
    const isAlreadyViewedInState = studentCurrentCourseProgress?.progress?.some(
      (item) => item.lectureId === lectureId && item.viewed
    );

    if (!isAlreadyViewedInState) {
      // Mark this lecture as being processed to prevent re-triggering
      viewedLecturesRef.current[lectureId] = true;
      updateCourseProgress();
    }
  }, [currentLecture, updateCourseProgress, studentCurrentCourseProgress]);

  useEffect(() => {
    if (showConfetti) setTimeout(() => setShowConfetti(false), 15000);
  }, [showConfetti]);

  console.log(currentLecture, "currentLecture");

  return (
    <div className="flex flex-col h-screen bg-[#1c1d1f] text-white">
      {showConfetti && <Confetti />}
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
          <h1 className="text-lg font-bold hidden md:block">
            {studentCurrentCourseProgress?.courseDetails?.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setShowCertificateSidebar(!showCertificateSidebar)}
            className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white"
            size="sm"
          >
            <Award className="h-4 w-4 mr-2" />
            Certificate
          </Button>
          <Button onClick={() => setIsSideBarOpen(!isSideBarOpen)}>
            {isSideBarOpen ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
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
            onProgressUpdate={setCurrentLecture}
            progressData={currentLecture}
          />
          <div className="p-6 bg-[#1c1d1f]">
            <h2 className="text-2xl font-bold mb-2">{currentLecture?.title}</h2>
          </div>
        </div>
        <div
          className={`fixed top-[64px] right-0 bottom-0 w-[400px] bg-[#1c1d1f] border-l border-gray-700 transition-all duration-300 ${
            isSideBarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <Tabs defaultValue="content" className="h-full flex flex-col">
            <TabsList className="grid bg-[#1c1d1f] w-full grid-cols-2 p-0 h-14">
              <TabsTrigger
                value="content"
                className=" text-black rounded-none h-full"
              >
                Course Content
              </TabsTrigger>
              <TabsTrigger
                value="overview"
                className=" text-black rounded-none h-full"
              >
                Overview
              </TabsTrigger>
            </TabsList>
            <TabsContent value="content">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {studentCurrentCourseProgress?.courseDetails?.curriculum.map(
                    (item) => (
                      <div
                        className="flex items-center space-x-2 text-sm text-white font-bold cursor-pointer"
                        key={item._id}
                      >
                        {studentCurrentCourseProgress?.progress?.find(
                          (progressItem) => progressItem.lectureId === item._id
                        )?.viewed ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Play className="h-4 w-4 " />
                        )}
                        <span>{item?.title}</span>
                      </div>
                    )
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="overview" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-4">About this course</h2>
                  <p className="text-gray-400">
                    {studentCurrentCourseProgress?.courseDetails?.description}
                  </p>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Certificate Sidebar */}
        <div
          className={`fixed top-[64px] right-0 bottom-0 w-[500px] bg-[#1c1d1f] border-l border-gray-700 shadow-xl transition-all duration-300 z-50 ${
            showCertificateSidebar ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Certificate Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Course Certificate</h2>
                    <p className="text-sm text-gray-400">Your completion certificate</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowCertificateSidebar(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Certificate Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Course Info */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Course Details</h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex justify-between">
                      <span>Course:</span>
                      <span className="text-white font-medium">
                        {studentCurrentCourseProgress?.courseDetails?.title || "Course Name"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Student:</span>
                      <span className="text-white font-medium">
                        {auth?.user?.userName || "Student Name"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={`font-medium ${isCourseCompleted ? 'text-green-400' : 'text-yellow-400'}`}>
                        {isCourseCompleted ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Certificate Preview */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Certificate Preview</h3>
                  <div className="relative">
                    <div 
                      className={`relative rounded-lg overflow-hidden border-2 border-amber-200 transition-all duration-300 ${
                        isCourseCompleted 
                          ? 'opacity-100 shadow-lg hover:shadow-xl cursor-pointer hover:scale-105 border-amber-300' 
                          : 'opacity-60 blur-sm cursor-pointer hover:opacity-70'
                      }`}
                    >
                      <img 
                        src="/images/certificate_bg.png" 
                        alt="Course Certificate" 
                        className="w-full h-auto object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      {/* Fallback if image doesn't load */}
                      <div className="hidden bg-white rounded-lg border-2 border-amber-200 p-6 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Award className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                          Certificate of Completion
                        </h4>
                        <p className="text-gray-600 mb-4">
                          {studentCurrentCourseProgress?.courseDetails?.title || "Course Name"}
                        </p>
                        <div className="text-sm text-gray-500">
                          {isCourseCompleted ? "Ready to download" : "Complete all lectures to unlock"}
                        </div>
                      </div>
                    </div>
                    
                    {/* Overlay for incomplete course */}
                    {!isCourseCompleted && (
                      <div className="absolute inset-0 bg-gray-900 bg-opacity-80 rounded-lg flex items-center justify-center">
                        <div className="text-center text-white">
                          <Lock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                          <p className="text-lg font-semibold mb-2">Certificate Locked</p>
                          <p className="text-sm text-gray-300">Complete all lectures to unlock your certificate</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Download Section */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Download Certificate</h3>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-300">
                      {isCourseCompleted ? (
                        <p className="text-green-400">✅ Your certificate is ready for download!</p>
                      ) : (
                        <p className="text-yellow-400">⏳ Complete all lectures to unlock your certificate</p>
                      )}
                    </div>
                    
                    <Button
                      onClick={handleDownloadCertificate}
                      disabled={!isCourseCompleted}
                      className={`w-full ${
                        isCourseCompleted
                          ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isCourseCompleted ? 'Download Certificate (PDF)' : 'Complete Course to Download'}
                    </Button>
                    
                    {isCourseCompleted && (
                      <div className="text-xs text-gray-400 text-center">
                        Certificate will be downloaded as a PDF file
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Info */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Course Progress</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Lectures Completed:</span>
                      <span className="text-white font-medium">
                        {studentCurrentCourseProgress?.progress?.filter(p => p.viewed).length || 0} / {studentCurrentCourseProgress?.courseDetails?.curriculum?.length || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-yellow-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${studentCurrentCourseProgress?.courseDetails?.curriculum?.length > 0 
                            ? (studentCurrentCourseProgress?.progress?.filter(p => p.viewed).length || 0) / studentCurrentCourseProgress?.courseDetails?.curriculum?.length * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={lockCourse}>
        <DialogContent className="sm:w-[425px]">
          <DialogHeader>
             <DialogTitle>You can&apos;t view this page</DialogTitle>
            <DialogDescription>
              Please purchase this course to get access
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Dialog open={showCourseCompleteDialog} onOpenChange={setShowCourseCompleteDialog}>
        <DialogContent showOverlay={false} className="sm:w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-green-500 text-center">Congratulations!</DialogTitle>
             <DialogDescription className="flex flex-col gap-3">
               <Label className=" text-center">You have completed the course</Label>
               <div className="flex flex-col gap-3">
                 <div className="flex flex-row justify-evenly gap-3">
                   <Button onClick={() => {
                     setShowCourseCompleteDialog(false);
                     navigate("/student-courses");
                   }}>
                     My Courses Page
                   </Button>
                   <Button onClick={() => {
                     setShowCourseCompleteDialog(false);
                     handleRewatchCourse();
                   }}>Rewatch Course</Button>
                 </div>
                 <Button 
                   onClick={() => {
                     setShowCourseCompleteDialog(false);
                     handleDownloadCertificate();
                   }} 
                   className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-semibold"
                 >
                   <Download className="w-4 h-4 mr-2" />
                   Download Certificate
                 </Button>
               </div>
             </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentViewCourseProgressPage;