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
const path = require('path');

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://mohammedsahal1243:sahal124867@cluster0.1eaz3.mongodb.net/e-learn";



// CORS allowlist from env (comma-separated)
const CORS_ORIGINS = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// Add your Render.com domains to the allowed origins
const allowedOrigins = [
  ...CORS_ORIGINS,
  'https://lms-platform-client.onrender.com'
];

// Debug CORS configuration
console.log('Allowed CORS origins:', allowedOrigins);

// Enhanced CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, server-to-server, or curl requests)
    if (!origin) {
      console.log('CORS: No origin (server-to-server request) - ALLOWED');
      return callback(null, true);
    }

    // Log all incoming origins for debugging
    console.log('CORS: Request from origin:', origin);

    // Check if the origin is in the allowed list
    const originIsAllowed = allowedOrigins.some(allowedOrigin => {
      // Exact match or pattern match for subdomains
      if (allowedOrigin.includes('*')) {
        const regexPattern = new RegExp('^' + allowedOrigin.replace(/\*/g, '.*') + '$');
        return regexPattern.test(origin);
      }
      return origin === allowedOrigin;
    });

    if (originIsAllowed) {
      console.log('CORS: Origin allowed -', origin);
      callback(null, true);
    } else {
      console.log('CORS: Origin blocked -', origin);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "X-CSRF-Token",
    "X-Requested-With",
    "Accept"
  ],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight requests globally
app.options('*', cors());

app.use(express.static(path.join(__dirname, 'public')));



// Serve static frontend files (Vite outputs to dist)
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

// Enhanced security headers with CSP
const { directives } = cspOptions;
const dynamicConnectSrc = new Set([...(directives.connectSrc || ["'self'"])]);
const dynamicMediaSrc = new Set([...(directives.mediaSrc || [])]);
// Add allowed CORS origins to CSP connectSrc
CORS_ORIGINS.forEach((o) => dynamicConnectSrc.add(o));
// Allow localhost backend server
dynamicConnectSrc.add("http://localhost:5000");
dynamicConnectSrc.add("https://localhost:5000");
// Add any additional allowed domains here if needed
// Ensure Cloudinary is allowed for media
dynamicMediaSrc.add("'self'");
dynamicMediaSrc.add("https://res.cloudinary.com");
dynamicMediaSrc.add("https://*.cloudinary.com");
dynamicMediaSrc.add("blob:");
dynamicMediaSrc.add("data:");

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...directives,
      connectSrc: Array.from(dynamicConnectSrc),
      mediaSrc: Array.from(dynamicMediaSrc),
    }
  },
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
  const origin = req.get('Origin') || req.get('Referer') || 'Unknown';
  const userAgent = req.get('User-Agent') || 'Unknown';
  const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log(`Origin: ${origin}`);
  console.log(`User-Agent: ${userAgent}`);
  console.log(`Is Mobile: ${isMobile}`);
  
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


const csrfProtection = csrf({ cookie: {
  key: "csrfToken",
  httpOnly: false, // readable by JS to set header
  sameSite: "lax",
  secure: false, // set true if serving over HTTPS
}});

app.use(csrfProtection);


// Note: This catch-all must be registered AFTER API routes
// Moved below after routes registration



// Endpoint for clients to fetch CSRF token
app.get("/csrf-token", (req, res) => {
  if (typeof req.csrfToken === 'function') {
  return res.status(200).json({ csrfToken: req.csrfToken() });
  }
  return res.status(200).json({ csrfToken: null });
});

app.get('/favicon.ico', (req, res) => res.sendStatus(204));


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

// SPA fallback: send index.html for any non-API route
app.get('*', (req, res, next) => {
  // Only treat as API for explicit API roots; allow SPA routes like /instructor/... to render
  const apiPrefixes = [
    '/secure',
    '/media',
    '/instructor/course', // narrow to instructor API only
    '/student',
    '/notify'
  ];
  const isApi = apiPrefixes.some((p) => req.path === p || req.path.startsWith(p + '/'))
    || req.path === '/csrf-token'
    || req.path === '/health'
    || req.path === '/favicon.ico';

  if (isApi) return next();

  return res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
});


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







// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");
// const helmet = require("helmet");
// const rateLimit = require("express-rate-limit");
// const { generalApiLimiter } = require("./middleware/rate-limiters");
// const { cspOptions, securityLoggerMiddleware } = require("./middleware/security-middleware");
// const cookieParser = require("cookie-parser");
// const csrf = require("csurf");
// const mongoSanitize = require("express-mongo-sanitize");
// const mongoose = require("mongoose");
// const authRoutes = require("./routes/auth-routes/index");
// const secureAuthRoutes = require("./routes/secure-auth-routes");
// const mediaRoutes = require("./routes/instructor-routes/media-routes");
// const instructorCourseRoutes = require("./routes/instructor-routes/course-routes");
// const instructorAnalyticsRoutes = require("./routes/instructor-routes/analytics-routes");
// const studentViewCourseRoutes = require("./routes/student-routes/course-routes");
// const studentViewOrderRoutes = require("./routes/student-routes/order-routes");
// const studentCoursesRoutes = require("./routes/student-routes/student-courses-routes");
// const studentCourseProgressRoutes = require("./routes/student-routes/course-progress-routes");
// const studentAnalyticsRoutes = require("./routes/student-routes/analytics-routes");
// const notifyRoutes = require("./routes/notify-routes");
// const secureInstructorRoutes = require("./routes/instructor-routes/secure-instructor-routes");
// const path = require('path');

// const app = express();
// app.set("trust proxy", 1);
// const PORT = process.env.PORT || 5000;
// const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://mohammedsahal1243:sahal124867@cluster0.1eaz3.mongodb.net/e-learn";

// app.use(express.static(path.join(__dirname, 'public')));

// // CORS allowlist from env (comma-separated)
// const CORS_ORIGINS = (process.env.CORS_ORIGINS || "")
//   .split(",")
//   .map((o) => o.trim())
//   .filter(Boolean);

// // Add your Render.com domains to the allowed origins
// const allowedOrigins = [
//   ...CORS_ORIGINS,
//   'https://lms-platform-client.onrender.com'
// ];

// // Debug CORS configuration
// console.log('Allowed CORS origins:', allowedOrigins);

// // Enhanced CORS configuration
// app.use(cors({
//   origin: function (origin, callback) {
//     // Allow requests with no origin (like mobile apps, server-to-server, or curl requests)
//     if (!origin) {
//       console.log('CORS: No origin (server-to-server request) - ALLOWED');
//       return callback(null, true);
//     }

//     // Log all incoming origins for debugging
//     console.log('CORS: Request from origin:', origin);

//     // Check if the origin is in the allowed list
//     const originIsAllowed = allowedOrigins.some(allowedOrigin => {
//       // Exact match or pattern match for subdomains
//       if (allowedOrigin.includes('*')) {
//         const regexPattern = new RegExp('^' + allowedOrigin.replace(/\*/g, '.*') + '$');
//         return regexPattern.test(origin);
//       }
//       return origin === allowedOrigin;
//     });

//     if (originIsAllowed) {
//       console.log('CORS: Origin allowed -', origin);
//       callback(null, true);
//     } else {
//       console.log('CORS: Origin blocked -', origin);
//       callback(new Error('Not allowed by CORS'), false);
//     }
//   },
//   methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS", "PATCH"],
//   allowedHeaders: [
//     "Content-Type", 
//     "Authorization", 
//     "X-CSRF-Token",
//     "X-Requested-With",
//     "Accept"
//   ],
//   credentials: true,
//   preflightContinue: false,
//   optionsSuccessStatus: 204
// }));

// // Handle preflight requests globally
// app.options('*', cors());

// // Serve static frontend files (Vite outputs to dist)
// app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

// // Enhanced security headers with CSP
// const { directives } = cspOptions;
// const dynamicConnectSrc = new Set([...(directives.connectSrc || ["'self'"])]);
// const dynamicMediaSrc = new Set([...(directives.mediaSrc || [])]);

// // Add allowed CORS origins to CSP connectSrc
// allowedOrigins.forEach((origin) => {
//   if (origin.startsWith('http')) {
//     dynamicConnectSrc.add(origin);
//   }
// });

// // Allow localhost backend server and common services
// dynamicConnectSrc.add("http://localhost:5000");
// dynamicConnectSrc.add("https://localhost:5000");
// dynamicConnectSrc.add("ws://localhost:5173"); // Vite HMR
// dynamicConnectSrc.add("wss://localhost:5173");

// // Ensure Cloudinary is allowed for media
// dynamicMediaSrc.add("'self'");
// dynamicMediaSrc.add("https://res.cloudinary.com");
// dynamicMediaSrc.add("https://*.cloudinary.com");
// dynamicMediaSrc.add("blob:");
// dynamicMediaSrc.add("data:");

// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       ...directives,
//       connectSrc: Array.from(dynamicConnectSrc),
//       mediaSrc: Array.from(dynamicMediaSrc),
//       // Relax CSP for development if needed
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Consider removing unsafe-inline/eval in production
//       styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
//       fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
//       imgSrc: ["'self'", "data:", "https:", "blob:"],
//     }
//   },
//   crossOriginEmbedderPolicy: false,
//   crossOriginResourcePolicy: { policy: "cross-origin" },
//   hsts: {
//     maxAge: 31536000,
//     includeSubDomains: true,
//     preload: true
//   }
// }));

// // Security logging
// app.use(securityLoggerMiddleware);

// // Parse cookies (for CSRF token cookie)
// app.use(cookieParser());

// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // No local uploads serving needed when using Cloudinary-only

// // Sanitize MongoDB operators from payloads
// app.use(mongoSanitize());

// // General API limiter (skip CSRF token & health)
// const apiLimiter = generalApiLimiter;
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // Increased window
//   max: 100, // Increased limit
//   standardHeaders: true,
//   legacyHeaders: false,
//   skip: (req) => {
//     // Skip for CSRF token even on auth routes
//     return req.path === "/csrf-token";
//   },
// });

// // Apply rate limiters
// app.use("/auth", authLimiter); // route-level strict/moderate also applied within router
// app.use((req, res, next) => {
//   // Skip CSRF token and health for general limiter
//   if (req.path === "/csrf-token" || req.path === "/health") return next();
//   return apiLimiter(req, res, next);
// });

// // Request logging middleware
// app.use((req, res, next) => {
//   const origin = req.get('Origin') || req.get('Referer') || 'Unknown';
//   const userAgent = req.get('User-Agent') || 'Unknown';
//   const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
//   console.log(`Origin: ${origin}`);
//   console.log(`User-Agent: ${userAgent}`);
//   console.log(`Is Mobile: ${isMobile}`);
  
//   if (req.params && Object.keys(req.params).length > 0) {
//     console.log('Request params:', req.params);
//   }
//   if (req.query && Object.keys(req.query).length > 0) {
//     // Filter out undefined values and empty strings
//     const cleanQuery = Object.fromEntries(
//       Object.entries(req.query).filter(([key, value]) => 
//         value !== undefined && value !== '' && key !== 'undefined'
//       )
//     );
//     if (Object.keys(cleanQuery).length > 0) {
//       console.log('Request query:', cleanQuery);
//     }
//   }
//   next();
// });

// // CSRF protection configuration
// const csrfProtection = csrf({ 
//   cookie: {
//     key: "csrfToken",
//     httpOnly: true, // Should be true for security
//     sameSite: "lax", // Use "none" if you need cross-site and have HTTPS
//     secure: process.env.NODE_ENV === 'production', // true in production for HTTPS
//   }
// });

// // Apply CSRF protection to relevant routes
// app.use(csrfProtection);

// // Endpoint for clients to fetch CSRF token (must be after CSRF middleware)
// app.get("/csrf-token", (req, res) => {
//   console.log('CSRF token endpoint hit');
  
//   // Set additional CORS headers explicitly for this endpoint
//   res.header('Access-Control-Allow-Credentials', 'true');
  
//   if (typeof req.csrfToken === 'function') {
//     const token = req.csrfToken();
//     console.log('CSRF token generated:', token ? 'Yes' : 'No');
//     return res.status(200).json({ 
//       success: true,
//       csrfToken: token 
//     });
//   }
  
//   console.log('CSRF token function not available');
//   return res.status(200).json({ 
//     success: false,
//     csrfToken: null,
//     message: 'CSRF token not available'
//   });
// });

// // Health check endpoint
// app.get("/health", (req, res) => {
//   res.status(200).json({ 
//     status: "OK", 
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV || 'development'
//   });
// });

// app.get('/favicon.ico', (req, res) => res.sendStatus(204));

// // Database connection
// console.log("Attempting to connect to MongoDB...");
// console.log("MONGO_URI:", MONGO_URI ? "Set" : "Not set");

// if (!MONGO_URI) {
//   console.error("❌ MONGO_URI environment variable is not set!");
//   console.log("Please create a .env file in the server directory with:");
//   console.log("MONGO_URI=mongodb://localhost:27017/mern_lms");
//   console.log("PORT=5000");
//   console.log("JWT_SECRET=your_secret_key_here");
//   console.log("CORS_ORIGINS=https://lms-platform-client.onrender.com,https://lms-platform-5cz6.onrender.com");
//   process.exit(1);
// }

// mongoose
//   .connect(MONGO_URI)
//   .then(() => console.log("✅ MongoDB is connected successfully"))
//   .catch((e) => {
//     console.error("❌ MongoDB connection error:", e);
//     process.exit(1);
//   });

// // Routes configuration
// app.use("/auth", authRoutes); // Legacy auth routes
// app.use("/secure", secureAuthRoutes); // Enhanced secure auth routes
// app.use("/media", mediaRoutes);
// app.use("/instructor/course", instructorCourseRoutes);
// app.use("/instructor/analytics", instructorAnalyticsRoutes);
// app.use("/student/course", studentViewCourseRoutes);
// app.use("/student/order", studentViewOrderRoutes);
// app.use("/student/courses-bought", studentCoursesRoutes);
// app.use("/student/course-progress", studentCourseProgressRoutes);
// app.use("/student/analytics", studentAnalyticsRoutes);
// app.use("/notify", notifyRoutes);

// // Secure instructor routes with comprehensive security
// app.use("/secure/instructor", secureInstructorRoutes);

// // SPA fallback: send index.html for any non-API route - FIXED VERSION
// app.get('*', (req, res, next) => {
//   // Define all API route prefixes that should NOT serve the SPA
//   const apiPrefixes = [
//     '/secure',
//     '/media',
//     '/student',
//     '/notify',
//     '/csrf-token',
//     '/health',
//     '/auth', // ← ADDED: This was missing
//     '/instructor' // ← ADDED: This was missing
//   ];
  
//   // Check if the current path is an API route
//   const isApi = apiPrefixes.some((prefix) => req.path === prefix || req.path.startsWith(prefix + '/'))
//     || req.path === '/favicon.ico';

//   if (isApi) {
//     console.log(`API route detected: ${req.path} - passing to API handlers`);
//     return next();
//   }

//   console.log(`SPA route detected: ${req.path} - serving index.html`);
//   return res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
// });

// // Global error handler
// app.use((err, req, res, next) => {
//   console.log("Global error handler triggered:");
//   console.log("Error:", err.message);
//   console.log("Stack:", err.stack);
//   console.log("Request path:", req.path);
//   console.log("Request method:", req.method);
  
//   // Handle CORS errors specifically
//   if (err.message === 'Not allowed by CORS') {
//     return res.status(403).json({
//       success: false,
//       message: "CORS policy blocked this request",
//       details: `Origin not allowed: ${req.get('Origin')}`
//     });
//   }
  
//   // Handle CSRF token errors
//   if (err.code === 'EBADCSRFTOKEN') {
//     return res.status(403).json({
//       success: false,
//       message: "Invalid CSRF token",
//       details: "Please refresh the page and try again"
//     });
//   }
  
//   // Handle specific error types
//   if (err.name === 'ValidationError') {
//     return res.status(400).json({
//       success: false,
//       message: "Validation error",
//       details: err.message
//     });
//   }
  
//   if (err.name === 'CastError') {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid ID format",
//       details: err.message
//     });
//   }
  
//   if (err.name === 'UnauthorizedError') {
//     return res.status(401).json({
//       success: false,
//       message: "Authentication required",
//       details: err.message
//     });
//   }
  
//   res.status(500).json({
//     success: false,
//     message: "Something went wrong",
//     error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
//   });
// });

// app.listen(PORT, () => {
//   console.log(`Server is now running on port ${PORT}`);
//   console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
//   console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
// });



