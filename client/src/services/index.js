import axiosInstance from "@/api/axiosInstance";

export async function registerService(formData) {
  const { data } = await axiosInstance.post("/auth/register", formData);
  return data;
}

export async function loginService(formData) {
  const { data } = await axiosInstance.post("/auth/login", formData);
  return data;
}

export async function checkAuthService() {
  const { data } = await axiosInstance.get("/auth/check-auth");
  return data;
}

export async function mediaUploadService(formData, onProgressCallback) {
  const { data } = await axiosInstance.post("/media/upload", formData, {
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgressCallback(percentCompleted);
    },
    timeout: 300000, // 5 minutes timeout for large files
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
  return data;
}

export async function mediaDeleteService(id) {
  const { data } = await axiosInstance.delete(`/media/delete/${id}`);
  return data;
}

export async function fetchInstructorCourseListService() {
  const { data } = await axiosInstance.get(`/instructor/course/get`);
  return data;
}

export async function addNewCourseService(formData) {
  const { data } = await axiosInstance.post(`/instructor/course/add`, formData);
  return data;
}

export async function fetchInstructorCourseDetailsService(id) {
  const { data } = await axiosInstance.get(
    `/instructor/course/get/details/${id}`
  );
  return data;
}

export async function updateCourseByIdService(id, formData) {
  const { data } = await axiosInstance.put(
    `/instructor/course/update/${id}`,
    formData
  );
  return data;
}

export async function deleteCourseService(id, forceDelete = false) {
  try {
    const url = forceDelete ? `/instructor/course/delete/${id}?force=true` : `/instructor/course/delete/${id}`;
    const { data } = await axiosInstance.delete(url);
    return data;
  } catch (error) {
    // Re-throw the error with proper message
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to delete course');
    }
  }
}

export async function mediaBulkUploadService(formData, onProgressCallback) {
  const { data } = await axiosInstance.post("/media/bulk-upload", formData, {
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgressCallback(percentCompleted);
    },
    timeout: 600000, // 10 minutes timeout for bulk uploads
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
  return data;
}

export async function fetchStudentViewCourseListService(query) {
  const url = query ? `/student/course/get?${query}` : `/student/course/get`;
  const { data } = await axiosInstance.get(url);
  return data;
}

export async function fetchStudentViewCourseDetailsService(courseId) {
  const { data } = await axiosInstance.get(
    `/student/course/get/details/${courseId}`
  );
  return data;
}

export async function checkCoursePurchaseInfoService(courseId, studentId) {
  const { data } = await axiosInstance.get(
    `/student/course/purchase-info/${courseId}/${studentId}`
  );
  return data;
}

export async function createPaymentService(formData) {
  const { data } = await axiosInstance.post(`/student/order/create`, formData);
  return data;
}

export async function createRazorpayOrderService(payload) {
  const { data } = await axiosInstance.post(`/student/order/create`, payload);
  return data;
}

export async function captureAndFinalizePaymentService(
  paymentId,
  payerId,
  orderId
) {
  const { data } = await axiosInstance.post(`/student/order/capture`, {
    paymentId,
    payerId,
    orderId,
  });
  return data;
}

export async function fetchStudentBoughtCoursesService(studentId) {
  const { data } = await axiosInstance.get(
    `/student/courses-bought/get/${studentId}`
  );
  return data;
}

export async function getCurrentCourseProgressService(userId, courseId) {
  const { data } = await axiosInstance.get(
    `/student/course-progress/get/${userId}/${courseId}`
  );
  return data;
}

export async function markLectureAsViewedService(userId, courseId, lectureId) {
  const { data } = await axiosInstance.post(
    `/student/course-progress/mark-lecture-viewed`,
    {
      userId,
      courseId,
      lectureId,
    }
  );
  return data;
}

export async function resetCourseProgressService(userId, courseId) {
  const { data } = await axiosInstance.post(
    `/student/course-progress/reset-progress`,
    {
      userId,
      courseId,
    }
  );
  return data;
}

export async function downloadCertificateService(userId, courseId) {
  const response = await axiosInstance.get(
    `/student/course-progress/certificate/${userId}/${courseId}`,
    {
      responseType: "blob",
    }
  );
  return response;
}

export async function contactAdminService({ 
  fromEmail, 
  fromName, 
  phoneNumber,
  course,
  segment,
  institution,
  subject, 
  message 
}) {
  const { data } = await axiosInstance.post(`/notify/contact-admin`, {
    fromEmail,
    fromName,
    phoneNumber,
    course,
    segment,
    institution,
    subject,
    message,
  });
  return data;
}

export async function fetchStudentAnalyticsService(userId) {
  const { data } = await axiosInstance.get(`/student/analytics/get/${userId}`);
  return data;
}

export async function fetchInstructorAnalyticsService(instructorId) {
  const { data } = await axiosInstance.get(`/instructor/analytics/get/${instructorId}`);
  return data;
}


