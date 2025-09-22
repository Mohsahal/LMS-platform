import axios from "axios";
import { toast } from "@/hooks/use-toast";
import tokenManager from "@/utils/tokenManager";

const axiosInstance = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL).replace(/\/$/, ''),
  withCredentials: true,
});

// Fetch CSRF token with better caching and retry logic
let csrfToken = null;
let csrfFetchInFlight = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3; // 最大重试次数
let retryCount = 0;

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

  // 如果已达到最大重试次数，等待更长时间后重置计数
  if (retryCount >= MAX_RETRIES) {
    await new Promise(resolve => setTimeout(resolve, 30000)); // 等待30秒
    retryCount = 0;
    return null;
  }
  
  // Start new fetch
  const base = import.meta.env.VITE_API_BASE_URL
  // Ensure no double slashes in URL
  const csrfUrl = `${base.replace(/\/$/, '')}/csrf-token`;
  csrfFetchInFlight = axios
    .get(csrfUrl, { 
      withCredentials: true,
      timeout: 5000 // 5 second timeout
    })
    .then((res) => {
      csrfToken = res?.data?.csrfToken || null;
      lastFetchTime = now;
      retryCount = 0; // 成功后重置重试计数
      return csrfToken;
    })
    .catch((error) => {
      console.warn("CSRF token fetch failed:", error.message);
      retryCount++; // 失败时增加重试计数
      return null;
    })
    .finally(() => {
      // 根据重试次数增加重试间隔
      const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 30000); // 指数退避，最大30秒
      setTimeout(() => {
        csrfFetchInFlight = null;
      }, retryDelay);
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

    // Get current token and check if it's valid
    const accessToken = tokenManager.getCurrentToken();
    if (typeof accessToken === "string" && accessToken.trim().length > 0) {
      // For media uploads, check if token will expire soon and warn user
      const isMediaUpload = /\/media\/(upload|bulk-upload)/.test(config.url || "");
      if (isMediaUpload && tokenManager.willTokenExpireSoon(accessToken, 10)) {
        console.warn("Token will expire soon during upload. Consider refreshing the page.");
      }
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
    const isMediaUpload = /\/media\/(upload|bulk-upload)/.test(url);
    
    if (status === 401 || status === 403) {
      const message = error?.response?.data?.message || (status === 401 ? "Unauthorized" : "Forbidden");
      
      // Special handling for media uploads - don't auto-logout on token expiry
      if (isMediaUpload && status === 401 && message === "Token expired") {
        toast({ 
          title: "Upload failed", 
          description: "Your session expired during upload. Please refresh the page and try again." 
        });
        return Promise.reject(error);
      }
      
      if (!isAuthEndpoint) {
        // Only clear token and redirect for protected, non-auth endpoints
        tokenManager.removeToken();
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
