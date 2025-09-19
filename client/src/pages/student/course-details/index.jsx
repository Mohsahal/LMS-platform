import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import VideoPlayer from "@/components/video-player";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  createPaymentService,
  fetchStudentViewCourseDetailsService,
  captureAndFinalizePaymentService,
  checkCoursePurchaseInfoService,
} from "@/services";
import { CheckCircle, Lock, PlayCircle, BookOpen } from "lucide-react";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-sdk")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
import { useContext, useEffect, useState, useCallback } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";

function StudentViewCourseDetailsPage() {
  const {
    studentViewCourseDetails,
    setStudentViewCourseDetails,
    currentCourseDetailsId,
    setCurrentCourseDetailsId,
    loadingState,
    setLoadingState,
  } = useContext(StudentContext);

  const { auth } = useContext(AuthContext);
  const [isPurchased, setIsPurchased] = useState(false);

  const [displayCurrentVideoFreePreview, setDisplayCurrentVideoFreePreview] =
    useState(null);
  const [showFreePreviewDialog, setShowFreePreviewDialog] = useState(false);
  const [approvalUrl] = useState("");
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const fetchStudentViewCourseDetails = useCallback(async () => {
    const response = await fetchStudentViewCourseDetailsService(
      currentCourseDetailsId
    );

    if (response?.success) {
      setStudentViewCourseDetails(response?.data);
      setLoadingState(false);
    } else {
      setStudentViewCourseDetails(null);
      setLoadingState(false);
    }
  }, [currentCourseDetailsId, setStudentViewCourseDetails, setLoadingState]);

  function handleSetFreePreview(getCurrentVideoInfo) {
    console.log(getCurrentVideoInfo);
    setDisplayCurrentVideoFreePreview(getCurrentVideoInfo?.videoUrl);
  }

  async function handleCreatePayment() {
    if (isPurchased) return navigate(`/course-progress/${studentViewCourseDetails?._id}`);
    const paymentPayload = {
      userId: auth?.user?._id,
      userName: auth?.user?.userName,
      userEmail: auth?.user?.userEmail,
      orderStatus: "pending",
      paymentMethod: "razorpay",
      paymentStatus: "initiated",
      orderDate: new Date(),
      paymentId: "",
      payerId: "",
      instructorId: studentViewCourseDetails?.instructorId,
      instructorName: studentViewCourseDetails?.instructorName,
      courseImage: studentViewCourseDetails?.image,
      courseTitle: studentViewCourseDetails?.title,
      courseId: studentViewCourseDetails?._id,
      coursePricing: studentViewCourseDetails?.pricing,
    };

    console.log(paymentPayload, "paymentPayload");
    const sdkLoaded = await loadRazorpayScript();
    if (!sdkLoaded) return alert("Failed to load Razorpay SDK");
    const response = await createPaymentService(paymentPayload);
    if (!response?.success) return alert(response?.message || "Failed to create order");

    const { razorpayOrderId, amount, currency, keyId, orderId } = response.data;
    const options = {
      key: keyId,
      amount,
      currency: currency || "INR",
      name: "Course Purchase",
      description: studentViewCourseDetails?.title,
      order_id: razorpayOrderId,
      prefill: { name: auth?.user?.userName, email: auth?.user?.userEmail },
      theme: { color: "#111827" },
      handler: async function (rzpRes) {
        const finalize = await captureAndFinalizePaymentService(
          rzpRes.razorpay_payment_id,
          rzpRes.razorpay_signature || "",
          orderId
        );
        if (finalize?.success) {
          setIsPurchased(true);
          navigate(`/course-progress/${studentViewCourseDetails?._id}`);
        } else {
          alert("Payment captured but order finalize failed");
        }
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  useEffect(() => {
    if (displayCurrentVideoFreePreview !== null) setShowFreePreviewDialog(true);
  }, [displayCurrentVideoFreePreview]);

  useEffect(() => {
    if (currentCourseDetailsId !== null) fetchStudentViewCourseDetails();
  }, [currentCourseDetailsId, fetchStudentViewCourseDetails]);

  useEffect(() => {
    if (id) setCurrentCourseDetailsId(id);
  }, [id, setCurrentCourseDetailsId]);

  // Check purchase status to toggle CTA
  useEffect(() => {
    async function checkPurchased() {
      if (!auth?.user?._id || !id) return;
      const resp = await checkCoursePurchaseInfoService(id, auth?.user?._id);
      if (resp?.success) setIsPurchased(Boolean(resp?.data));
    }
    checkPurchased();
  }, [auth?.user?._id, id]);

  useEffect(() => {
    if (!location.pathname.includes("course/details")) {
      setStudentViewCourseDetails(null);
      setCurrentCourseDetailsId(null);
    }
  }, [location.pathname, setStudentViewCourseDetails, setCurrentCourseDetailsId]);

  if (loadingState) return <Skeleton />;

  if (approvalUrl !== "") {
    window.location.href = approvalUrl;
  }

  const getIndexOfFreePreviewUrl =
    studentViewCourseDetails !== null
      ? studentViewCourseDetails?.curriculum?.findIndex(
          (item) => item.freePreview
        )
      : -1;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto">
        {/* Hero Header */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="px-4 lg:px-8 py-12">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {studentViewCourseDetails?.title}
                </h1>
              </div>
              {/* <p className="text-lg text-gray-600 mb-8 max-w-4xl leading-relaxed">
                {studentViewCourseDetails?.subtitle}
              </p> */}
{/*               
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900">Instructor</span>
                  </div>
                  <p className="text-gray-600">{studentViewCourseDetails?.instructorName}</p>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Globe className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900">Language</span>
                  </div>
                  <p className="text-gray-600">{studentViewCourseDetails?.primaryLanguage}</p>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900">Students</span>
                  </div>
                  <p className="text-gray-600">
                    {studentViewCourseDetails?.students.length}{" "}
                    {studentViewCourseDetails?.students.length <= 1 ? "Student" : "Students"}
                  </p>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900">Created</span>
                  </div>
                  <p className="text-gray-600">{studentViewCourseDetails?.date.split("T")[0]}</p>
                </div>
              </div> */}
            </div>
          </div>
        </div>
        <div className="px-4 lg:px-4 py-12">
          <div className="max-w-10xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-6">
              <main className="flex-grow space-y-8">
                <Card className="border border-gray-200 bg-white">
                  <CardHeader className="bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">What you&apos;ll learn</CardTitle>
                        <p className="text-gray-600">Key skills and knowledge you&apos;ll gain from this course</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {studentViewCourseDetails?.objectives
                        .split(",")
                        .map((objective, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                            <span className="text-gray-700">{objective}</span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 bg-white">
                  <CardHeader className="bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">Course Description</CardTitle>
                        <p className="text-gray-600">Detailed overview of the course content</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 leading-relaxed">
                        {studentViewCourseDetails?.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 bg-white">
                  <CardHeader className="bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                        <PlayCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">Course Curriculum</CardTitle>
                        <p className="text-gray-600">Complete list of lectures and lessons</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {studentViewCourseDetails?.curriculum?.map(
                        (curriculumItem, index) => (
                          <div
                            key={index}
                            className={`${
                              curriculumItem?.freePreview
                                ? "cursor-pointer hover:bg-blue-50 hover:border-blue-300"
                                : "cursor-not-allowed opacity-60"
                            } flex items-center gap-4 p-4 rounded-lg border border-gray-200 transition-all duration-200`}
                            onClick={
                              curriculumItem?.freePreview
                                ? () => handleSetFreePreview(curriculumItem)
                                : null
                            }
                          >
                            <div className="flex-shrink-0">
                              {curriculumItem?.freePreview ? (
                                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                  <PlayCircle className="w-5 h-5 text-white" />
                                </div>
                              ) : (
                                <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
                                  <Lock className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{curriculumItem?.title}</h4>
                              <p className="text-sm text-gray-500">
                                {curriculumItem?.freePreview ? "Free Preview Available" : "Premium Content"}
                              </p>
                            </div>
                            {curriculumItem?.freePreview && (
                              <div className="flex-shrink-0">
                                <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                  Preview
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </main>
              <aside className="w-full lg:w-96">
                <Card className="sticky top-4 border border-gray-200 bg-white">
                  <CardHeader className="bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                        <PlayCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-gray-900">Course Preview</CardTitle>
                        <p className="text-sm text-gray-600">Watch a free preview</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="aspect-video mb-6 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      <VideoPlayer
                        url={
                          getIndexOfFreePreviewUrl !== -1
                            ? studentViewCourseDetails?.curriculum[
                                getIndexOfFreePreviewUrl
                              ].videoUrl
                            : ""
                        }
                        width="100%"
                        height="200px"
                      />
                    </div>
                    
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 mb-2">
                          ₹{Number(studentViewCourseDetails?.pricing || 0).toLocaleString("en-IN")}
                        </div>
                        <p className="text-gray-600">One-time payment • Lifetime access</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-gray-700">Full course access</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-gray-700">Certificate of completion</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-gray-700">Lifetime access</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-gray-700">Mobile and desktop access</span>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleCreatePayment} 
                        className="w-full bg-gray-800 hover:bg-black text-white font-semibold py-3 text-lg transition-colors duration-200"
                      >
                        {isPurchased ? "Go to Course" : `Enroll Now - ₹${Number(studentViewCourseDetails?.pricing || 0).toLocaleString("en-IN")}`}
                      </Button>
                      
                      <p className="text-center text-sm text-gray-500">
                        30-day money-back guarantee
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </aside>
            </div>
          </div>
        </div>
      </div>
      <Dialog
        open={showFreePreviewDialog}
        onOpenChange={() => {
          setShowFreePreviewDialog(false);
          setDisplayCurrentVideoFreePreview(null);
        }}
      >
        <DialogContent className="w-[900px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Course Preview</DialogTitle>
          </DialogHeader>
          <div className="aspect-video rounded-lg bg-gray-100 flex items-center justify-center">
            <VideoPlayer
              url={displayCurrentVideoFreePreview}
              width="450px"
              height="200px"
            />
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 mb-3">Available Previews:</h4>
            {studentViewCourseDetails?.curriculum
              ?.filter((item) => item.freePreview)
              .map((filteredItem, index) => (
                <p
                  key={index}
                  onClick={() => handleSetFreePreview(filteredItem)}
                  className="cursor-pointer text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors duration-200"
                >
                  {filteredItem?.title}
                </p>
              ))}
          </div>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-gray-300">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentViewCourseDetailsPage;