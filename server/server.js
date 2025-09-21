require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { generalApiLimiter } = require("./middleware/rate-limiters");
const { cspOptions, securityLoggerMiddleware } = require("./middleware/security-middleware");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const mongoSanitize = require("express-mongo-sanitize");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth-routes/index");
const secureAuthRoutes = require("./routes/secure-auth-routes");
const mediaRoutes = require("./routes/instructor-routes/media-routes");
const instructorCourseRoutes = require("./routes/instructor-routes/course-routes");
const instructorAnalyticsRoutes = require("./routes/instructor-routes/analytics-routes");
const studentViewCourseRoutes = require("./routes/student-routes/course-routes");
const studentViewOrderRoutes = require("./routes/student-routes/order-routes");
const studentCoursesRoutes = require("./routes/student-routes/student-courses-routes");
const studentCourseProgressRoutes = require("./routes/student-routes/course-progress-routes");
const studentAnalyticsRoutes = require("./routes/student-routes/analytics-routes");
const notifyRoutes = require("./routes/notify-routes");
const secureInstructorRoutes = require("./routes/instructor-routes/secure-instructor-routes");


const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://mohammedsahal1243:sahal124867@cluster0.1eaz3.mongodb.net/e-learn";
// CORS configuration with dynamic origin support for development
const allowedOrigins = [
  'http://192.168.57.76:5173'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      
      // For development, allow any localhost or 192.168.x.x origin
      if (process.env.NODE_ENV === 'development') {
        const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)(:\d+)?$/.test(origin);
        if (isLocalhost) {
          return callback(null, true);
        }
      }
      
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    },
    methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

// Enhanced security headers with CSP
app.use(helmet({
  contentSecurityPolicy: cspOptions,
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Security logging
app.use(securityLoggerMiddleware);

// Parse cookies (for CSRF token cookie)
app.use(cookieParser());

app.use(express.json());

// No local uploads serving needed when using Cloudinary-only

// Sanitize MongoDB operators from payloads
app.use(mongoSanitize());

// General API limiter (skip CSRF token & health)
const apiLimiter = generalApiLimiter;
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Increased window
  max: 100, // Increased limit
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip for CSRF token even on auth routes
    return req.path === "/csrf-token";
  },
});

// Apply rate limiters
app.use("/auth", authLimiter); // route-level strict/moderate also applied within router
app.use((req, res, next) => {
  // Skip CSRF token and health for general limiter
  if (req.path === "/csrf-token" || req.path === "/health") return next();
  return apiLimiter(req, res, next);
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.params && Object.keys(req.params).length > 0) {
    console.log('Request params:', req.params);
  }
  if (req.query && Object.keys(req.query).length > 0) {
    // Filter out undefined values and empty strings
    const cleanQuery = Object.fromEntries(
      Object.entries(req.query).filter(([key, value]) => 
        value !== undefined && value !== '' && key !== 'undefined'
      )
    );
    if (Object.keys(cleanQuery).length > 0) {
      console.log('Request query:', cleanQuery);
    }
  }
  next();
});

// Handle CORS preflight requests
app.options('*', cors());

// CSRF protection (double-submit cookie pattern)
const csrfProtection = csrf({ cookie: {
  key: "csrfToken",
  httpOnly: false, // readable by JS to set header
  sameSite: "lax",
  secure: false, // set true if serving over HTTPS
}});

app.use(csrfProtection);

// Endpoint for clients to fetch CSRF token
app.get("/csrf-token", (req, res) => {
  return res.status(200).json({ csrfToken: req.csrfToken() });
});

//database connection
console.log("Attempting to connect to MongoDB...");
console.log("MONGO_URI:", MONGO_URI ? "Set" : "Not set");

if (!MONGO_URI) {
  console.error("❌ MONGO_URI environment variable is not set!");
  console.log("Please create a .env file in the server directory with:");
  console.log("MONGO_URI=mongodb://localhost:27017/mern_lms");
  console.log("PORT=5000");
  console.log("JWT_SECRET=your_secret_key_here");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB is connected successfully"))
  .catch((e) => {
    console.error("❌ MongoDB connection error:", e);
    process.exit(1);
  });

//routes configuration
app.use("/auth", authRoutes); // Legacy auth routes
app.use("/secure", secureAuthRoutes); // Enhanced secure auth routes
app.use("/media", mediaRoutes);
app.use("/instructor/course", instructorCourseRoutes);
app.use("/instructor/analytics", instructorAnalyticsRoutes);
app.use("/student/course", studentViewCourseRoutes);
app.use("/student/order", studentViewOrderRoutes);
app.use("/student/courses-bought", studentCoursesRoutes);
app.use("/student/course-progress", studentCourseProgressRoutes);
app.use("/student/analytics", studentAnalyticsRoutes);
app.use("/notify", notifyRoutes);

// Secure instructor routes with comprehensive security
app.use("/secure/instructor", secureInstructorRoutes);


app.use((err, req, res, next) => {
  console.log("Global error handler triggered:");
  console.log("Error:", err.message);
  console.log("Stack:", err.stack);
  console.log("Request path:", req.path);
  console.log("Request method:", req.method);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      details: err.message
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
      details: err.message
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
      details: err.message
    });
  }
  
  res.status(500).json({
    success: false,
    message: "Something went wrong",
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Server is now running on port ${PORT}`);
});
