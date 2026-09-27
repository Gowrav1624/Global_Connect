const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

// ==========================================
// CONFIG
// ==========================================

const passport = require("./config/passport");

// ==========================================
// ROUTES
// ==========================================

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const connectionRoutes = require("./routes/connectionRoutes");
const postRoutes = require("./routes/postRoutes");
const jobRoutes = require("./routes/jobRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reportRoutes = require("./routes/reportRoutes");
const searchRoutes = require("./routes/searchRoutes");

// ==========================================
// MIDDLEWARE
// ==========================================

const authMiddleware = require("./middleware/authMiddleware");

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

app.use(passport.initialize());

// ==========================================
// STATIC UPLOADS
// ==========================================

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "../uploads")
  )
);

// ==========================================
// API ROUTES
// ==========================================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/connections",
  connectionRoutes
);

app.use(
  "/api/posts",
  postRoutes
);

app.use(
  "/api/jobs",
  jobRoutes
);

app.use(
  "/api/messages",
  messageRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/reports",
  reportRoutes
);

app.use(
  "/api/search",
  searchRoutes
);

// ==========================================
// HEALTH CHECK
// ==========================================

app.get(
  "/api/health",
  (req, res) => {
    res.status(200).json({
      success: true,
      message:
        "Global_Connect API is running",
    });
  }
);

// ==========================================
// PROTECTED TEST ROUTE
// ==========================================

app.get(
  "/api/protected",
  authMiddleware,
  (req, res) => {
    res.status(200).json({
      success: true,
      message:
        "You accessed a protected route",
      user: req.user,
    });
  }
);

// ==========================================
// INVALID API ROUTE
// ==========================================

app.use(
  "/api",
  (req, res) => {
    res.status(404).json({
      success: false,
      message: "API route not found",
    });
  }
);

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use(
  (err, req, res, next) => {
    console.error(
      "Global server error:",
      err
    );

    res.status(500).json({
      success: false,
      message:
        "Internal server error",
      error:
        process.env.NODE_ENV ===
        "development"
          ? err.message
          : undefined,
    });
  }
);

module.exports = app;