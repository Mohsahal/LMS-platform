import axios from "axios";
import { toast } from "@/hooks/use-toast";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
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
  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  csrfFetchInFlight = axios
    .get(`${base}/csrf-token`, { 
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

    let accessToken = null;
    try {
      const raw = localStorage.getItem("accessToken");
      accessToken = raw ? JSON.parse(raw) : null;
    } catch (_) {
      accessToken = null;
    }
    if (typeof accessToken === "string" && accessToken.trim().length > 0) {
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
    const url = (error?.config?.url || "").toString();
    const isAuthLogin = /\/auth\/login($|\?)/.test(url);
    const isAuthRegister = /\/auth\/register($|\?)/.test(url);
    const isAuthEndpoint = isAuthLogin || isAuthRegister;
    if (status === 401 || status === 403) {
      const message = error?.response?.data?.message || (status === 401 ? "Unauthorized" : "Forbidden");
      if (!isAuthEndpoint) {
        // Only clear token and redirect for protected, non-auth endpoints
        try {
          localStorage.removeItem("accessToken");
        } catch {
          // ignore
        }
        toast({ title: "Session issue", description: message });
        if (typeof window !== "undefined") {
          window.location.href = "/auth";
        }
      } else if (isAuthLogin) {
        // For login failures, do not redirect or clear input; allow caller to handle toast
        // Optionally still surface a toast here if caller doesn't
        // toast({ title: "Login failed", description: message });
      }
    }
    // CSRF errors
    if (status === 419 || error?.response?.data?.message === "invalid csrf token") {
      toast({ title: "Security error", description: "Please refresh the page and try again" });
    }
    if (!status) {
      toast({ title: "Network error", description: error?.message || "Request failed" });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
