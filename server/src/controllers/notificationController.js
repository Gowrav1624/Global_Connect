const Notification = require("../models/Notification");

// ==========================================
// CREATE NOTIFICATION
// ==========================================

const createNotification = async ({
  recipient,
  sender = null,
  type,
  message,
}) => {
  try {
    const notification =
      await Notification.create({
        recipient,
        sender,
        type,
        message,
      });

    const populatedNotification =
      await Notification.findById(
        notification._id
      ).populate(
        "sender",
        "name email profilePic"
      );

    // Send real-time notification
    if (global.io && recipient) {
      global.io
        .to(recipient.toString())
        .emit("newNotification", {
          notification:
            populatedNotification,
        });
    }

    return populatedNotification;
  } catch (error) {
    console.error(
      "Create notification error:",
      error.message
    );

    return null;
  }
};

// ==========================================
// GET NOTIFICATIONS
// ==========================================

const getNotifications = async (
  req,
  res
) => {
  try {
    const notifications =
      await Notification.find({
        recipient: req.user.userId,
      })
        .populate(
          "sender",
          "name email profilePic"
        )
        .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get notifications",
      error: error.message,
    });
  }
};

// ==========================================
// MARK NOTIFICATION AS READ
// ==========================================

const markNotificationRead = async (
  req,
  res
) => {
  try {
    const notification =
      await Notification.findOne({
        _id: req.params.id,
        recipient: req.user.userId,
      });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message:
          "Notification not found",
      });
    }

    notification.isRead = true;

    await notification.save();

    return res.status(200).json({
      success: true,
      message:
        "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error(
      "Mark notification read error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to mark notification as read",
      error: error.message,
    });
  }
};

// ==========================================
// MARK ALL NOTIFICATIONS AS READ
// ==========================================

const markAllNotificationsRead = async (
  req,
  res
) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user.userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message:
        "All notifications marked as read",
    });
  } catch (error) {
    console.error(
      "Mark all notifications read error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to mark all notifications as read",
      error: error.message,
    });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};