require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const mongoSanitize = require("express-mongo-sanitize");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth-routes/index");
const mediaRoutes = require("./routes/instructor-routes/media-routes");
const instructorCourseRoutes = require("./routes/instructor-routes/course-routes");
const studentViewCourseRoutes = require("./routes/student-routes/course-routes");
const studentViewOrderRoutes = require("./routes/student-routes/order-routes");
const studentCoursesRoutes = require("./routes/student-routes/student-courses-routes");
const studentCourseProgressRoutes = require("./routes/student-routes/course-progress-routes");
const notifyRoutes = require("./routes/notify-routes");


const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://mohammedsahal1243:sahal124867@cluster0.1eaz3.mongodb.net/e-learn";

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000'
    ],
    methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

// Security headers
app.use(helmet());

// Parse cookies (for CSRF token cookie)
app.use(cookieParser());

app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Sanitize MongoDB operators from payloads
app.use(mongoSanitize());

// More lenient rate limiting with better exclusions
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Increased limit
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for CSRF token and health checks
    return req.path === "/csrf-token" || req.path === "/health";
  },
});
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
app.use("/auth", authLimiter);
app.use(apiLimiter);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.params && Object.keys(req.params).length > 0) {
    console.log('Request params:', req.params);
  }
  if (req.query && Object.keys(req.query).length > 0) {
    console.log('Request query:', req.query);
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
app.use("/auth", authRoutes);
app.use("/media", mediaRoutes);
app.use("/instructor/course", instructorCourseRoutes);
app.use("/student/course", studentViewCourseRoutes);
app.use("/student/order", studentViewOrderRoutes);
app.use("/student/courses-bought", studentCoursesRoutes);
app.use("/student/course-progress", studentCourseProgressRoutes);
app.use("/notify", notifyRoutes);


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
