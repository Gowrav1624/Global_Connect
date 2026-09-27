const express = require("express");

const {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getConnectionRequests,
  getConnections,
} = require("../controllers/connectionController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// GET MY CONNECTIONS
// ==========================================

router.get(
  "/",
  authMiddleware,
  getConnections
);

// ==========================================
// GET PENDING CONNECTION REQUESTS
// ==========================================

router.get(
  "/requests",
  authMiddleware,
  getConnectionRequests
);

// ==========================================
// SEND CONNECTION REQUEST
// ==========================================

router.post(
  "/request",
  authMiddleware,
  sendConnectionRequest
);

// ==========================================
// ACCEPT CONNECTION REQUEST
// ==========================================

router.put(
  "/:id/accept",
  authMiddleware,
  acceptConnectionRequest
);

// ==========================================
// REJECT CONNECTION REQUEST
// ==========================================

router.put(
  "/:id/reject",
  authMiddleware,
  rejectConnectionRequest
);

module.exports = router;