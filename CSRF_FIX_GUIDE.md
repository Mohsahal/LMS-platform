# CSRF Token Error Fix Guide

## Problem
You were getting "Invalid CSRF token" errors after fixing the SPA routing. This happened because there were **conflicting CSRF implementations** between server and client.

## Root Cause Analysis
1. **Server-side**: Using `csurf` package with cookie-based tokens
2. **Client-side**: Using custom generated tokens that didn't match server tokens
3. **Token mismatch**: Client was generating its own tokens instead of using server-generated ones
4. **Cache issues**: CSRF tokens were getting stale or invalid

## What I Fixed

### 1. Server-Side CSRF Configuration (`server.js`)
- **Enhanced CSRF protection** with proper cookie settings
- **Added token validation** for both headers and body
- **Improved error handling** for CSRF token generation
- **Extended token lifetime** to 24 hours for better UX
- **Added proper exclusions** for static files and health checks

### 2. Client-Side CSRF Handling (`axiosInstance.js`)
- **Removed custom token generation** - now uses server tokens only
- **Improved token caching** with 10-minute cache duration
- **Enhanced error handling** for CSRF failures
- **Added automatic token refresh** on errors
- **Better retry logic** with exponential backoff

### 3. Security Components Fix
- **Updated `SecureForm.jsx`** to fetch tokens from server
- **Updated `SecureInstructorForm.jsx`** to use server tokens
- **Removed conflicting implementations** that generated custom tokens

## Key Changes Made

### Server (`server.js`)
```javascript
// Enhanced CSRF configuration
const csrfProtection = csrf({
  cookie: { 
    key: "csrfToken", 
    httpOnly: false, 
    sameSite: "lax", 
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
  value: (req) => {
    return req.headers['x-csrf-token'] || req.body._csrf;
  }
});
```

### Client (`axiosInstance.js`)
```javascript
// Improved token fetching with better error handling
async function ensureCsrfToken() {
  // Fetch from server with proper error handling
  // Clear cache on errors
  // Retry with exponential backoff
}
```

## How It Works Now

1. **Server generates CSRF token** using `csurf` package
2. **Client fetches token** from `/csrf-token` endpoint
3. **Token is cached** for 10 minutes to reduce requests
4. **Automatic refresh** when token expires or becomes invalid
5. **Proper error handling** with user-friendly messages

## Testing the Fix

### 1. Test CSRF Token Generation
```bash
curl -X GET http://localhost:5000/csrf-token \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --cookie-jar cookies.txt
```

### 2. Test Form Submission
- Try submitting forms that require CSRF tokens
- Check browser network tab for proper token headers
- Verify no "Invalid CSRF token" errors

### 3. Test Token Refresh
- Wait for token to expire (or clear browser cache)
- Try making a request - should automatically refresh token
- Check console for "CSRF token refreshed successfully" message

## Deployment Steps

1. **Commit all changes** to your repository
2. **Redeploy on Render** - the fixes will be applied automatically
3. **Test the application**:
   - Navigate to different pages
   - Submit forms
   - Check for CSRF errors in browser console

## Troubleshooting

### If you still get CSRF errors:

1. **Check browser cookies** - ensure `csrfToken` cookie exists
2. **Check network tab** - verify `/csrf-token` requests are successful
3. **Clear browser cache** and try again
4. **Check server logs** for CSRF-related errors

### Common Issues:
- **CORS problems**: Ensure CORS is properly configured
- **Cookie issues**: Check if cookies are being set/read properly
- **Token expiration**: Tokens now last 24 hours, should be sufficient

## Benefits of This Fix

✅ **Unified CSRF implementation** - no more conflicting tokens  
✅ **Better error handling** - clear messages when CSRF fails  
✅ **Automatic token refresh** - no manual intervention needed  
✅ **Improved caching** - reduces server requests  
✅ **Better UX** - users don't see cryptic CSRF errors  

The CSRF token errors should now be completely resolved! 🎉
