// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
  
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import VideoPlayer from "@/components/video-player";
// import { AuthContext } from "@/context/auth-context";
// import { StudentContext } from "@/context/student-context";
// import {
//   getCurrentCourseProgressService,
//   markLectureAsViewedService,
//   resetCourseProgressService,
//   downloadCertificateService,
// } from "@/services";
// import { Check, ChevronLeft, ChevronRight, Play, BookOpen, Download, Award, Lock } from "lucide-react";
// import { useContext, useEffect, useState, useCallback, useRef, useMemo } from "react";
// import Confetti from "react-confetti";
// import { useNavigate, useParams } from "react-router-dom";
// import { useToast } from "@/hooks/use-toast";

// function StudentViewCourseProgressPage() {
//   const navigate = useNavigate();
//   const { auth } = useContext(AuthContext);
//   const { studentCurrentCourseProgress, setStudentCurrentCourseProgress } =
//     useContext(StudentContext);
//   const [lockCourse, setLockCourse] = useState(false);
//   const [currentLecture, setCurrentLecture] = useState(null);
//   const [showCourseCompleteDialog, setShowCourseCompleteDialog] =
//     useState(false);
//   const [showConfetti, setShowConfetti] = useState(false);
//   const [isSideBarOpen, setIsSideBarOpen] = useState(true);
//   const [isCourseCompleted, setIsCourseCompleted] = useState(false);
//   const isMarkingRef = useRef(false);
//   const markedLectureIdsRef = useRef(new Set());
//   const { toast } = useToast();
//   const { id } = useParams();

//   const curriculum = useMemo(() => 
//     studentCurrentCourseProgress?.courseDetails?.curriculum || [], 
//     [studentCurrentCourseProgress?.courseDetails?.curriculum]
//   );
//   const viewedCount = (studentCurrentCourseProgress?.progress || []).filter(p => p.viewed).length;
//   const totalLectures = curriculum.length || 0;
//   const overallProgressPct = totalLectures > 0 ? Math.round((viewedCount / totalLectures) * 100) : 0;

//   const selectLectureByIndex = useCallback((nextIndex) => {
//     if (nextIndex < 0 || nextIndex >= curriculum.length) return;
//     setCurrentLecture(curriculum[nextIndex]);
//   }, [curriculum]);

//   const getCurrentLectureIndex = useCallback(() => {
//     if (!currentLecture) return -1;
//     return curriculum.findIndex((l) => l._id === currentLecture._id);
//   }, [curriculum, currentLecture]);

//   const selectLectureById = useCallback((lectureId) => {
//     const nextIndex = curriculum.findIndex((l) => l._id === lectureId);
//     if (nextIndex !== -1) selectLectureByIndex(nextIndex);
//   }, [curriculum, selectLectureByIndex]);

//   const fetchCurrentCourseProgress = useCallback(async () => {
//     const response = await getCurrentCourseProgressService(auth?.user?._id, id);
//     if (response?.success) {
//       if (!response?.data?.isPurchased) {
//         setLockCourse(true);
//       } else {
//         setStudentCurrentCourseProgress({
//           courseDetails: response?.data?.courseDetails,
//           progress: response?.data?.progress,
//         });

//         if (response?.data?.completed) {
//           setCurrentLecture(response?.data?.courseDetails?.curriculum[0]);
//           setShowCourseCompleteDialog(true);
//           setShowConfetti(true);
//           setIsCourseCompleted(true);

//           return;
//         }

//         if (response?.data?.progress?.length === 0) {
//           // Start with first video if no progress
//           setCurrentLecture(response?.data?.courseDetails?.curriculum[0]);
//         } else {
//           // Find the last completed video and set next as current
//           const lastViewedIndex = response?.data?.progress.reduceRight(
//             (acc, obj, index) => {
//               return acc === -1 && obj.viewed ? index : acc;
//             },
//             -1
//           );

//           // If no videos completed, start with first video
//           if (lastViewedIndex === -1) {
//             setCurrentLecture(response?.data?.courseDetails?.curriculum[0]);
//           } else {
//             // Set next video after last completed, or stay on last if it's the final video
//             const nextIndex = Math.min(lastViewedIndex + 1, response?.data?.courseDetails?.curriculum.length - 1);
//             setCurrentLecture(response?.data?.courseDetails?.curriculum[nextIndex]);
//           }
//         }
//       }
//     }
//   }, [auth?.user?._id, id, setStudentCurrentCourseProgress]);

//   const updateCourseProgress = useCallback(async () => {
//     if (!currentLecture || !currentLecture._id) return;
//     const lectureId = currentLecture._id;
//     if (isMarkingRef.current) return;
//     if (markedLectureIdsRef.current.has(lectureId)) return;
//     isMarkingRef.current = true;
//     try {
//       const response = await markLectureAsViewedService(
//         auth?.user?._id,
//         studentCurrentCourseProgress?.courseDetails?._id,
//         lectureId
//       );
//       if (response?.success) {
//         markedLectureIdsRef.current.add(lectureId);
//         fetchCurrentCourseProgress();
        
//         // Auto-advance to next video after a short delay
//         setTimeout(() => {
//           const currentIndex = getCurrentLectureIndex();
//           if (currentIndex < curriculum.length - 1) {
//             console.log("Auto-advancing to next video");
//             selectLectureByIndex(currentIndex + 1);
//           }
//         }, 2000);
//       }
//     } finally {
//       isMarkingRef.current = false;
//     }
//   }, [currentLecture, auth?.user?._id, studentCurrentCourseProgress?.courseDetails?._id, fetchCurrentCourseProgress, curriculum.length, getCurrentLectureIndex, selectLectureByIndex]);

//   function handleNextLecture() {
//     const idx = getCurrentLectureIndex();
//     if (idx !== -1) selectLectureByIndex(idx + 1);
//   }

//   function handlePrevLecture() {
//     const idx = getCurrentLectureIndex();
//     if (idx !== -1) selectLectureByIndex(idx - 1);
//   }

//   async function handleRewatchCourse() {
//     const response = await resetCourseProgressService(
//       auth?.user?._id,
//       studentCurrentCourseProgress?.courseDetails?._id
//     );

//     if (response?.success) {
//       setCurrentLecture(null);
//       setShowConfetti(false);
//       setShowCourseCompleteDialog(false);
//       setIsCourseCompleted(false);
//       fetchCurrentCourseProgress();
//     }
//   }

//   async function handleDownloadCertificate() {
//     try {
//       const res = await downloadCertificateService(
//         auth?.user?._id,
//         studentCurrentCourseProgress?.courseDetails?._id
//       );
//       const blob = new Blob([res.data], { type: "application/pdf" });
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.href = url;
//       link.download = `certificate_${
//         auth?.user?.userName || "student"
//       }_${
//         studentCurrentCourseProgress?.courseDetails?.title || "course"
//       }.pdf`;
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(url);
//     } catch (e) {
//       console.error(e);
//     }
//   }

//   function handleCertificateClick() {
//     if (!isCourseCompleted) {
//       toast({
//         title: "Certificate Locked 🔒",
//         description: "Complete all lectures to unlock your certificate!",
//         variant: "default",
//       });
//     }
//   }

//   useEffect(() => {
//     fetchCurrentCourseProgress();
//   }, [id, fetchCurrentCourseProgress]);

//   useEffect(() => {
//     const progress = Number(currentLecture?.progressValue || 0);
//     const isCompleted = Boolean(currentLecture?.completed);
    
//     console.log("Progress check:", { progress, isCompleted, lectureId: currentLecture?._id, marked: markedLectureIdsRef.current.has(currentLecture?._id) });
    
//     if ((progress >= 0.9 || isCompleted) && currentLecture?._id && !markedLectureIdsRef.current.has(currentLecture._id)) {
//       console.log("Marking lecture as completed:", currentLecture._id);
//       updateCourseProgress();
//     }
//   }, [currentLecture, updateCourseProgress]);

//   useEffect(() => {
//     if (showConfetti) setTimeout(() => setShowConfetti(false), 15000);
//   }, [showConfetti]);

//   console.log(currentLecture, "currentLecture");

//   return (
//     <div className="flex flex-col h-screen bg-gray-50">
//       {showConfetti && <Confetti />}
//       <div className="flex items-center justify-between px-6 bg-white border-b border-gray-200 shadow-sm h-20">
//         <div className="flex items-center space-x-4">
//           <Button
//             variant="outline"
//             onClick={() => navigate("/student-courses")}
//             className=""
//             size="lg"
//           >
//             <ChevronLeft className="h-7 w-4 mr-2" />
//             Back to My Courses
//           </Button>
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
//               <Play className="w-5 h-5 text-white" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold text-gray-900 hidden md:block">
//             {studentCurrentCourseProgress?.courseDetails?.title}
//           </h1>
//               <p className="text-sm text-gray-500">Course Progress</p>
//             </div>
//           </div>
//         </div>
//         <div className="flex items-center gap-6">
//           <div className="hidden md:flex items-center gap-3">
//             <div className="w-36">
//               <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
//                 <div className="h-2 bg-blue-600" style={{ width: `${overallProgressPct}%` }} />
//               </div>
//             </div>
//             <div className="text-sm text-gray-700 font-medium">{overallProgressPct}%</div>
//             <div className="text-xs text-gray-500">{viewedCount}/{totalLectures} completed</div>
//           </div>
//           <Button 
//             onClick={() => setIsSideBarOpen(!isSideBarOpen)}
//             className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 shadow-md hover:shadow-lg transition-all duration-200"
//           >
//             {isSideBarOpen ? (
//               <ChevronRight className="h-5 w-5" />
//             ) : (
//               <ChevronLeft className="h-5 w-5" />
//             )}
//           </Button>
//         </div>
//       </div>
//       <div className="flex flex-1 overflow-hidden">
//         <div
//           className={`flex-1 ${
//             isSideBarOpen ? "mr-[400px]" : ""
//           } transition-all duration-300`}
//         >
//           <div className="bg-white rounded-lg shadow-lg m-4 overflow-hidden">
//           <VideoPlayer
//             width="100%"
//             height="500px"
//             url={currentLecture?.videoUrl}
//             onProgressUpdate={setCurrentLecture}
//             progressData={currentLecture}
//           />
//             <div className="p-6 bg-gradient-to-r from-gray-50 to-white">
//               <div className="flex items-center gap-3 mb-2">
//                 <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
//                   <Play className="w-4 h-4 text-white" />
//                 </div>
//                 <h2 className="text-2xl font-bold text-gray-900">{currentLecture?.title}</h2>
//               </div>
//               <div className="flex items-center justify-between mt-2">
//                 <div className="flex items-center gap-4 text-sm text-gray-600">
//                   <div className="flex items-center gap-2">
//                     <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                     <span>Currently Playing</span>
//                   </div>
//                   <div className="hidden md:flex items-center gap-2">
//                     <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
//                     <span>Overall Progress</span>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Button variant="outline" onClick={handlePrevLecture} disabled={getCurrentLectureIndex() <= 0} className="min-w-[110px] justify-start">
//                     <ChevronLeft className="h-4 w-4 mr-1" /> Prev
//                   </Button>
//                   <Button variant="outline" onClick={handleNextLecture} disabled={getCurrentLectureIndex() === curriculum.length - 1} className="min-w-[110px] justify-between">
//                     Next <ChevronRight className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//         <div
//           className={`fixed top-20 right-0 bottom-0 w-[400px] bg-white border-l border-gray-200 shadow-xl transition-all duration-300 ${
//             isSideBarOpen ? "translate-x-0" : "translate-x-full"
//           }`}
//         >
//           <Tabs defaultValue="content" className="h-full flex flex-col">
//             <TabsList className="grid bg-gradient-to-r from-gray-50 to-white w-full grid-cols-2 p-0 h-16 border-b border-gray-200">
//               <TabsTrigger
//                 value="content"
//                 className="text-gray-700 font-semibold rounded-none h-full data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200"
//               >
//                 Course Content
//               </TabsTrigger>
//               <TabsTrigger
//                 value="overview"
//                 className="text-gray-700 font-semibold rounded-none h-full data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200"
//               >
//                 Overview
//               </TabsTrigger>
//             </TabsList>
//             <TabsContent value="content">
//               <ScrollArea className="h-full">
//                 <div className="p-6 space-y-3">
//                   <div className="flex items-center gap-3 mb-6">
//                     <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
//                       <Play className="w-4 h-4 text-white" />
//                     </div>
//                     <div>
//                       <h3 className="font-semibold text-gray-900">Course Curriculum</h3>
//                       <p className="text-sm text-gray-500">{studentCurrentCourseProgress?.courseDetails?.curriculum?.length || 0} lectures</p>
//                     </div>
//                   </div>
//                   {curriculum.map(
//                     (item, index) => (
//                       <div
//                         className={`flex items-center space-x-3 p-4 rounded-lg border ${
//                           currentLecture?._id === item._id ? "border-blue-400 bg-blue-50 ring-2 ring-blue-100" : "border-gray-200"
//                         } hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 cursor-pointer group`}
//                         key={item._id}
//                         onClick={() => selectLectureById(item._id)}
//                       >
//                         <div className="flex-shrink-0">
//                           {studentCurrentCourseProgress?.progress?.find(
//                             (progressItem) => progressItem.lectureId === item._id
//                           )?.viewed ? (
//                             <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
//                               <Check className="h-4 w-4 text-white" />
//                             </div>
//                           ) : (
//                             <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center group-hover:from-blue-500 group-hover:to-indigo-600 transition-all duration-200">
//                               <Play className="h-4 w-4 text-white" />
//                             </div>
//                           )}
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <div className="flex items-center gap-2 mb-1">
//                             <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
//                             <span className="text-sm font-semibold text-gray-900 truncate">{item?.title}</span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                         {studentCurrentCourseProgress?.progress?.find(
//                           (progressItem) => progressItem.lectureId === item._id
//                         )?.viewed ? (
//                               <span className="text-xs text-green-600 font-medium">Completed</span>
//                         ) : (
//                               <span className="text-xs text-gray-500">Not started</span>
//                         )}
//                           </div>
//                         </div>
//                       </div>
//                     )
//                   )}
//                 </div>
//               </ScrollArea>
//             </TabsContent>
//             <TabsContent value="overview" className="flex-1 overflow-hidden">
//               <ScrollArea className="h-full">
//                 <div className="p-6">
//                   <div className="flex items-center gap-3 mb-6">
//                     <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
//                       <BookOpen className="w-4 h-4 text-white" />
//                     </div>
//                     <div>
//                       <h2 className="text-xl font-bold text-gray-900">Course Overview</h2>
//                       <p className="text-sm text-gray-500">Course details and information</p>
//                     </div>
//                   </div>
//                   <div className="space-y-6">
//                     <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
//                       <h3 className="font-semibold text-gray-900 mb-2">About this course</h3>
//                       <p className="text-gray-700 leading-relaxed">
//                     {studentCurrentCourseProgress?.courseDetails?.description}
//                   </p>
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div className="bg-white border border-gray-200 rounded-lg p-4">
//                         <div className="flex items-center gap-2 mb-2">
//                           <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
//                             <Play className="w-3 h-3 text-white" />
//                           </div>
//                           <span className="text-sm font-semibold text-gray-900">Lectures</span>
//                         </div>
//                         <p className="text-2xl font-bold text-gray-900">{studentCurrentCourseProgress?.courseDetails?.curriculum?.length || 0}</p>
//                       </div>
//                       <div className="bg-white border border-gray-200 rounded-lg p-4">
//                         <div className="flex items-center gap-2 mb-2">
//                           <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
//                             <Check className="w-3 h-3 text-white" />
//                           </div>
//                           <span className="text-sm font-semibold text-gray-900">Completed</span>
//                         </div>
//                         <p className="text-2xl font-bold text-gray-900">
//                           {studentCurrentCourseProgress?.progress?.filter(p => p.viewed).length || 0}
//                         </p>
//                       </div>
//                     </div>
                    
//                     {/* Certificate Section */}
//                     <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-6 border border-amber-200">
//                       <div className="flex items-center gap-3 mb-4">
//                         <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg flex items-center justify-center">
//                           <Award className="w-4 h-4 text-white" />
//                         </div>
//                         <div>
//                           <h3 className="text-lg font-bold text-gray-900">Course Certificate</h3>
//                           <p className="text-sm text-gray-600">Download your completion certificate</p>
//                         </div>
//                       </div>
                      
//                       <div className="relative">
//                         {/* Certificate Image Preview */}
//                         <div 
//                           onClick={handleCertificateClick}
//                           className={`relative rounded-lg overflow-hidden border-2 border-amber-200 transition-all duration-300 ${
//                             isCourseCompleted 
//                               ? 'opacity-100 shadow-lg hover:shadow-xl cursor-pointer hover:scale-105 border-amber-300' 
//                               : 'opacity-60 blur-sm cursor-pointer hover:opacity-70'
//                           }`}
//                         >
//                           <img 
//                             src="/images/certificate_bg.png" 
//                             alt="Course Certificate" 
//                             className="w-full h-auto object-contain"
//                             onError={(e) => {
//                               e.target.style.display = 'none';
//                               e.target.nextSibling.style.display = 'flex';
//                             }}
//                           />
//                           {/* Fallback if image doesn't load */}
//                           <div className="hidden bg-white rounded-lg border-2 border-amber-200 p-6 text-center">
//                             <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
//                               <Award className="w-8 h-8 text-white" />
//                             </div>
//                             <h4 className="text-xl font-bold text-gray-900 mb-2">
//                               Certificate of Completion
//                             </h4>
//                             <p className="text-gray-600 mb-4">
//                               {studentCurrentCourseProgress?.courseDetails?.title || "Course Name"}
//                             </p>
//                             <div className="text-sm text-gray-500">
//                               {isCourseCompleted ? "Ready to download" : "Complete all lectures to unlock"}
//                             </div>
//                           </div>
//                         </div>
                        
//                         {/* Overlay for incomplete course */}
//                         {!isCourseCompleted && (
//                           <div className="absolute inset-0 bg-gray-900 bg-opacity-60 rounded-lg flex items-center justify-center">
//                             <div className="text-center text-white">
//                               <Lock className="w-8 h-8 mx-auto mb-2" />
//                               <p className="text-sm font-semibold">Complete all lectures to unlock</p>
//                             </div>
//                           </div>
//                         )}
//                       </div>
                      
//                       {/* Download Button */}
//                       <div className="mt-4">
//                         <Button
//                           onClick={handleDownloadCertificate}
//                           disabled={!isCourseCompleted}
//                           className={`w-full ${
//                             isCourseCompleted
//                               ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'
//                               : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                           }`}
//                         >
//                           <Download className="w-4 h-4 mr-2" />
//                           {isCourseCompleted ? 'Download Certificate' : 'Complete Course to Download'}
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </ScrollArea>
//             </TabsContent>
//           </Tabs>
//         </div>
//       </div>
//       <Dialog open={lockCourse} onOpenChange={setLockCourse}>
//         <DialogContent className="sm:w-[425px] bg-white border-0 shadow-2xl">
//           <DialogHeader className="text-center">
//             <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
//               <Check className="w-8 h-8 text-white" />
//             </div>
//             <DialogTitle className="text-2xl font-bold text-gray-900">Access Restricted</DialogTitle>
//             <DialogDescription className="text-gray-600 mt-2">
//               Please purchase this course to get access to all content and features.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="flex justify-center mt-6">
//             <Button 
//               onClick={() => setLockCourse(false)}
//               className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
//             >
//               Got it
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//       <Dialog className="max-w-[500px]" open={showCourseCompleteDialog} onOpenChange={setShowCourseCompleteDialog}>
//         <DialogContent showOverlay={false} className="bg-white border-0 shadow-2xl">
//           <DialogHeader className="text-center">
//             <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
//               <Check className="w-10 h-10 text-white" />
//             </div>
//             <DialogTitle className="text-3xl font-bold text-gray-900 mb-2">Congratulations! 🎉</DialogTitle>
//             <DialogDescription className="flex flex-col gap-6">
//               <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
//                 <Label className="text-lg font-semibold text-gray-900">You have successfully completed the course!</Label>
//                 <p className="text-gray-600 mt-2">Great job on finishing all the lectures. You can now download your certificate or rewatch the course.</p>
//               </div>
//               <div className="grid grid-cols-1 gap-3">
//                 <Button 
//                   onClick={() => navigate("/student-courses")}
//                   className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
//                 >
//                   My Courses Page
//                 </Button>
//                 <Button 
//                   onClick={handleRewatchCourse}
//                   className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
//                 >
//                   Rewatch Course
//                 </Button>
//                 <Button 
//                   onClick={handleDownloadCertificate} 
//                   variant="outline"
//                   className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 font-semibold transition-all duration-200"
//                 >
//                   Download Certificate
//                 </Button>
//                 {/* <Button 
//                   onClick={() => setShowCourseCompleteDialog(false)}
//                   variant="outline"
//                   className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-semibold transition-all duration-200"
//                 >
//                   Close
//                 </Button> */}
//               </div>
//             </DialogDescription>
//           </DialogHeader>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// export default StudentViewCourseProgressPage;



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
    if (currentLecture?.progressValue === 1) updateCourseProgress();
  }, [currentLecture, updateCourseProgress]);

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