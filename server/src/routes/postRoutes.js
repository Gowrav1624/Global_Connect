const express = require("express");

const {
  createPost,
  getPosts,
  getUserFeed,
  toggleLike,
  addComment,
  repostPost,
} = require("../controllers/postController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createPost);

router.get("/", authMiddleware, getPosts);

// User's own + connections' feed
router.get("/feed/:userId", authMiddleware, getUserFeed);

router.put("/:id/like", authMiddleware, toggleLike);

router.post("/:id/comment", authMiddleware, addComment);

router.post("/:id/repost", authMiddleware, repostPost);

module.exports = router;