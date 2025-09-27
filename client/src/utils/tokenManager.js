// Token management utility for handling JWT token refresh

class TokenManager {
  constructor() {
    this.refreshPromise = null;
    this.isRefreshing = false;
  }

  // Get current token from localStorage
  getCurrentToken() {
    try {
      const raw = localStorage.getItem("accessToken");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  // Set token in localStorage
  setToken(token) {
    try {
      localStorage.setItem("accessToken", JSON.stringify(token));
    } catch (error) {
      console.error('Failed to save token:', error);
    }
  }

  // Remove token from localStorage
  removeToken() {
    try {
      localStorage.removeItem("accessToken");
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  }

  // Check if token is expired
  isTokenExpired(token) {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  // Get token expiration time
  getTokenExpiration(token) {
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch {
      return null;
    }
  }

  // Check if token will expire soon (within 5 minutes)
  willTokenExpireSoon(token, minutes = 5) {
    if (!token) return true;
    
    const expiration = this.getTokenExpiration(token);
    if (!expiration) return true;
    
    const currentTime = Date.now();
    const timeUntilExpiration = expiration - currentTime;
    const minutesUntilExpiration = timeUntilExpiration / (1000 * 60);
    
    return minutesUntilExpiration <= minutes;
  }

  // Refresh token if needed
  async refreshTokenIfNeeded() {
    const currentToken = this.getCurrentToken();
    
    if (!currentToken) {
      return null;
    }

    // If token is not expired and won't expire soon, return current token
    if (!this.isTokenExpired(currentToken) && !this.willTokenExpireSoon(currentToken)) {
      return currentToken;
    }

    // If already refreshing, wait for the existing refresh
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    // Start refresh process
    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  // Perform actual token refresh
  async performTokenRefresh() {
    try {
      // For now, we'll just return the current token
      // In a real implementation, you would call a refresh endpoint
      const currentToken = this.getCurrentToken();
      
      if (this.isTokenExpired(currentToken)) {
        // Token is expired, user needs to login again
        this.removeToken();
        throw new Error('Token expired, please login again');
      }
      
      return currentToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.removeToken();
      throw error;
    }
  }

  // Ensure valid token before making requests
  async ensureValidToken() {
    try {
      const token = await this.refreshTokenIfNeeded();
      if (!token) {
        throw new Error('No valid token available');
      }
      return token;
    } catch (error) {
      // Redirect to login if token refresh fails
      if (typeof window !== "undefined") {
        // Use React Router navigation instead of window.location.href
        // This will be handled by the RouteGuard component
        window.location.href = "/auth";
      }
      throw error;
    }
  }
}

// Create singleton instance
const tokenManager = new TokenManager();

export default tokenManager;
