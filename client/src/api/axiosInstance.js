import axios from "axios";
import { toast } from "@/hooks/use-toast";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

// Fetch CSRF token once and cache in memory
let csrfToken = null;
async function ensureCsrfToken() {
  if (csrfToken) return csrfToken;
  try {
    const res = await axios.get("http://localhost:5000/csrf-token", { withCredentials: true });
    csrfToken = res?.data?.csrfToken || null;
  } catch {
    // ignore
  }
  return csrfToken;
}

axiosInstance.interceptors.request.use(
  async (config) => {
    // Attach CSRF token header for state-changing requests
    const method = (config.method || "get").toLowerCase();
    if (["post", "put", "patch", "delete"].includes(method)) {
      const token = await ensureCsrfToken();
      if (token) config.headers["X-CSRF-Token"] = token;
    }

    const accessToken = JSON.parse(localStorage.getItem("accessToken")) || "";

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (err) => Promise.reject(err)
);

// Global response interceptor for auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      try {
        localStorage.removeItem("accessToken");
      } catch {
        // ignore
      }
      const message = error?.response?.data?.message || (status === 401 ? "Unauthorized" : "Forbidden");
      toast({ title: "Session issue", description: message });
      if (typeof window !== "undefined") {
        window.location.href = "/auth";
      }
    }
    // CSRF errors
    if (status === 419 || error?.response?.data?.message === "invalid csrf token") {
      toast({ title: "Security error", description: "Please refresh the page and try again" });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
