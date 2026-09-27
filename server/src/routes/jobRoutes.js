const express = require("express");

const {
  createJob,
  getJobs,
  searchJobs,
  applyForJob,
  updateApplicationStatus,
  getMyApplications,
  saveJob,
  getSavedJobs,
  deleteJob,
} = require("../controllers/jobController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Search jobs
router.get(
  "/search",
  authMiddleware,
  searchJobs
);

// My applications
router.get(
  "/my-applications",
  authMiddleware,
  getMyApplications
);

// Saved jobs
router.get(
  "/saved",
  authMiddleware,
  getSavedJobs
);

// Get all jobs
router.get(
  "/",
  authMiddleware,
  getJobs
);

// Create job
router.post(
  "/",
  authMiddleware,
  createJob
);

// Apply for job
router.post(
  "/:id/apply",
  authMiddleware,
  applyForJob
);

// Save / unsave job
router.put(
  "/:id/save",
  authMiddleware,
  saveJob
);

// Update application status
router.put(
  "/:id/applications/:applicantId/status",
  authMiddleware,
  updateApplicationStatus
);

// Delete job
router.delete(
  "/:id",
  authMiddleware,
  deleteJob
);

module.exports = router;