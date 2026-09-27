const express = require("express");

const {
  createReport,
  getReports,
  updateReportStatus,
  deleteReport,
} = require("../controllers/reportController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Submit a report
router.post(
  "/",
  authMiddleware,
  createReport
);

// Admin: get all reports
router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  getReports
);

// Admin: update report status
router.put(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  updateReportStatus
);

// Admin: delete report
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteReport
);

module.exports = router;