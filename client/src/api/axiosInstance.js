import axios from "axios";
import { toast } from "@/hooks/use-toast";
import tokenManager from "@/utils/tokenManager";

const axiosInstance = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, ''),
  withCredentials: true,
});

// Fetch CSRF token with better caching and retry logic
let csrfToken = null;
let csrfFetchInFlight = null;
let lastFetchTime = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes (increased for better UX)
const MAX_RETRIES = 3; 
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

  if (retryCount >= MAX_RETRIES) {
    console.warn('CSRF token fetch failed after max retries, clearing cache');
    csrfToken = null;
    lastFetchTime = 0;
    retryCount = 0;
    return null;
  }
  
  // Start new fetch
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
  const csrfUrl = `${base.replace(/\/$/, '')}/csrf-token`;
  
  csrfFetchInFlight = axios
    .get(csrfUrl, { 
      withCredentials: true,
      timeout: 10000, // Increased timeout
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then((res) => {
      if (res.data && res.data.success && res.data.csrfToken) {
        csrfToken = res.data.csrfToken;
        lastFetchTime = now;
        retryCount = 0;
        console.log('CSRF token refreshed successfully');
        return csrfToken;
      } else {
        throw new Error('Invalid CSRF token response');
      }
    })
    .catch((error) => {
      console.warn("CSRF token fetch failed:", error.message);
      retryCount++;
      csrfToken = null; // Clear invalid token
      return null;
    })
    .finally(() => {
      const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
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
          // Use React Router navigation instead of window.location.href
          // This will be handled by the RouteGuard component
          window.location.href = "/auth";
        }
      } else if (isAuthLogin) {
        // For login failures, do not redirect or clear input; allow caller to handle toast
        // Optionally still surface a toast here if caller doesn't
        // toast({ title: "Login failed", description: message });
      }
    }
    // CSRF errors - clear token and retry
    if (status === 419 || 
        error?.response?.data?.message?.toLowerCase().includes("csrf") ||
        error?.response?.data?.message?.toLowerCase().includes("invalid token")) {
      
      // Clear cached CSRF token to force refresh
      csrfToken = null;
      lastFetchTime = 0;
      retryCount = 0;
      
      toast({ 
        title: "Security error", 
        description: "Please refresh the page and try again",
        variant: "destructive"
      });
      
      // Optionally refresh the page after a short delay
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      }, 2000);
    }
    if (!status) {
      toast({ title: "Network error", description: error?.message || "Request failed" });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
