const express = require("express");

const {
  sendMessage,
  getConversation,
} = require("../controllers/messageController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Send a message
router.post("/", authMiddleware, sendMessage);

// Get conversation with another user
router.get("/:userId", authMiddleware, getConversation);

module.exports = router;