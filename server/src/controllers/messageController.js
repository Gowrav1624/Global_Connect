const Message = require("../models/Message");
const {
  createNotification,
} = require("./notificationController");

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { receiver, content } = req.body;

    if (!receiver || !content) {
      return res.status(400).json({
        success: false,
        message: "Receiver and content are required",
      });
    }

    const message = await Message.create({
      sender: req.user.userId,
      receiver,
      content,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name email profilePic")
      .populate("receiver", "name email profilePic");

    // Create notification for receiver
    const senderName = populatedMessage.sender?.name || "Someone";

    await createNotification({
      recipient: receiver,
      sender: req.user.userId,
      type: "message",
      message: `${senderName} sent you a new message`,
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};

// Get conversation between two users
const getConversation = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        {
          sender: currentUserId,
          receiver: otherUserId,
        },
        {
          sender: otherUserId,
          receiver: currentUserId,
        },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name email profilePic")
      .populate("receiver", "name email profilePic");

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get conversation",
      error: error.message,
    });
  }
};

module.exports = {
  sendMessage,
  getConversation,
};