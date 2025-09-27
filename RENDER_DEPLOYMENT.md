# Render Deployment Guide for E-Learn Platform

## Problem Solved
This guide fixes the "Cannot GET /route" error when refreshing pages in your React SPA deployed on Render.

## Solutions Implemented

### 1. Static Configuration File (Primary Solution)
Created `client/static.json`:
```json
{
  "root": "dist/",
  "routes": {
    "/**": "index.html"
  }
}
```

### 2. Enhanced Redirect Rules
Updated `client/public/_redirects` with comprehensive routing rules that:
- Redirect all SPA routes to index.html
- Preserve API routes for backend communication

### 3. Server-Side SPA Fallback
Your `server.js` already has proper SPA fallback configuration that:
- Serves static files from `client/dist`
- Routes API requests to backend handlers
- Serves `index.html` for all non-API routes

### 4. Alternative Configuration
Created `render.yaml` for advanced deployment configuration.

## Deployment Steps

### Option 1: Deploy as Static Site (Recommended)
1. Connect your repository to Render
2. Choose "Static Site" as the service type
3. Set build command: `cd client && npm install && npm run build`
4. Set publish directory: `client/dist`
5. The `static.json` file will automatically handle routing

### Option 2: Deploy as Web Service
1. Connect your repository to Render
2. Choose "Web Service" as the service type
3. Set build command: `cd server && npm install`
4. Set start command: `cd server && node server.js`
5. The server.js SPA fallback will handle routing

### Option 3: Deploy Both (Full Stack)
1. Deploy backend as Web Service (server)
2. Deploy frontend as Static Site (client)
3. Update CORS origins in server.js to include your frontend URL

## Environment Variables
Make sure to set these in Render:
- `MONGO_URI`: Your MongoDB connection string
- `JWT_SECRET`: Your JWT secret key
- `CORS_ORIGINS`: Your frontend URL (if using separate deployments)

## Testing
After deployment, test these scenarios:
1. Navigate to `/` - should work
2. Navigate to `/instructor` - should work
3. Navigate to `/courses` - should work
4. Refresh any page - should work (no more 404 errors)
5. Direct URL access - should work

## Troubleshooting
If you still get 404 errors:
1. Ensure `static.json` is in the client directory
2. Check that build output goes to `client/dist`
3. Verify `_redirects` file is in `client/public`
4. For web service deployment, ensure server.js is serving static files correctly
