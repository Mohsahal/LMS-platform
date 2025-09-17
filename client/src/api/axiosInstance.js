import axios from "axios";
import { toast } from "@/hooks/use-toast";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

// Fetch CSRF token with better caching and retry logic
let csrfToken = null;
let csrfFetchInFlight = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function ensureCsrfToken() {
  const now = Date.now();
  
  // Return cached token if still valid
  if (csrfToken && (now - lastFetchTime) < CACHE_DURATION) {
    return csrfToken;
  }
  
  // If already fetching, wait for it
  if (csrfFetchInFlight) {
    return csrfFetchInFlight;
  }
  
  // Start new fetch
  csrfFetchInFlight = axios
    .get("http://localhost:5000/csrf-token", { 
      withCredentials: true,
      timeout: 5000 // 5 second timeout
    })
    .then((res) => {
      csrfToken = res?.data?.csrfToken || null;
      lastFetchTime = now;
      return csrfToken;
    })
    .catch((error) => {
      console.warn("CSRF token fetch failed:", error.message);
      return null;
    })
    .finally(() => {
      // Allow refetch after 1 second
      setTimeout(() => {
        csrfFetchInFlight = null;
      }, 1000);
    });
    
  return csrfFetchInFlight;
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
