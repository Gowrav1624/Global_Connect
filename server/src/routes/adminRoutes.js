  const express = require("express");

  const {
    getAllUsers,
    deleteUser,
    deletePost,
    deleteJob,
  } = require("../controllers/adminController");

  const authMiddleware = require("../middleware/authMiddleware");
  const adminMiddleware = require("../middleware/adminMiddleware");

  const router = express.Router();

  // Get all users - Admin only
  router.get(
    "/users",
    authMiddleware,
    adminMiddleware,
    getAllUsers
  );

  // Delete user - Admin only
  router.delete(
    "/users/:id",
    authMiddleware,
    adminMiddleware,
    deleteUser
  );

  // Delete post - Admin only
  router.delete(
    "/posts/:id",
    authMiddleware,
    adminMiddleware,
    deletePost
  );

  // Delete job - Admin only
  router.delete(
    "/jobs/:id",
    authMiddleware,
    adminMiddleware,
    deleteJob
  );

  module.exports = router;