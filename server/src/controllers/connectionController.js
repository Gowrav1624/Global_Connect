const User = require("../models/User");
const {
  createNotification,
} = require("./notificationController");

// ==========================================
// SEND CONNECTION REQUEST
// ==========================================

const sendConnectionRequest = async (req, res) => {
  try {
    const senderId = req.user.userId;

    // Support both:
    // POST /connections/request with { receiverId }
    // and older routes using /connections/request/:id
    const receiverId =
      req.body.receiverId || req.params.id;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required",
      });
    }

    if (
      senderId.toString() ===
      receiverId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot send a connection request to yourself",
      });
    }

    const sender =
      await User.findById(senderId);

    const receiver =
      await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check whether already connected
    const alreadyConnected =
      sender.connections.some(
        (id) =>
          id.toString() ===
          receiverId.toString()
      );

    if (alreadyConnected) {
      return res.status(400).json({
        success: false,
        message:
          "Users are already connected",
      });
    }

    // Check whether request was already sent
    const requestAlreadySent =
      receiver.connectionRequests.some(
        (id) =>
          id.toString() ===
          senderId.toString()
      );

    if (requestAlreadySent) {
      return res.status(400).json({
        success: false,
        message:
          "Connection request already sent",
      });
    }

    receiver.connectionRequests.push(
      senderId
    );

    await receiver.save();

    // Create notification
    await createNotification({
      recipient: receiverId,
      sender: senderId,
      type: "connection",
      message: `${sender.name} sent you a connection request`,
    });

    res.status(200).json({
      success: true,
      message:
        "Connection request sent successfully",
    });
  } catch (error) {
    console.error(
      "Send connection request error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to send connection request",
      error: error.message,
    });
  }
};

// ==========================================
// ACCEPT CONNECTION REQUEST
// ==========================================

const acceptConnectionRequest = async (
  req,
  res
) => {
  try {
    const userId = req.user.userId;

    const requesterId =
      req.params.id ||
      req.params.requestId;

    if (!requesterId) {
      return res.status(400).json({
        success: false,
        message:
          "Requester ID is required",
      });
    }

    const user =
      await User.findById(userId);

    const requester =
      await User.findById(requesterId);

    if (!user || !requester) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check request exists
    const requestExists =
      user.connectionRequests.some(
        (id) =>
          id.toString() ===
          requesterId.toString()
      );

    if (!requestExists) {
      return res.status(400).json({
        success: false,
        message:
          "No connection request from this user",
      });
    }

    // Remove request
    user.connectionRequests =
      user.connectionRequests.filter(
        (id) =>
          id.toString() !==
          requesterId.toString()
      );

    // Add requester to user's connections
    const alreadyConnected =
      user.connections.some(
        (id) =>
          id.toString() ===
          requesterId.toString()
      );

    if (!alreadyConnected) {
      user.connections.push(
        requesterId
      );
    }

    // Add user to requester's connections
    const requesterAlreadyConnected =
      requester.connections.some(
        (id) =>
          id.toString() ===
          userId.toString()
      );

    if (!requesterAlreadyConnected) {
      requester.connections.push(
        userId
      );
    }

    await user.save();
    await requester.save();

    // Notify requester
    await createNotification({
      recipient: requesterId,
      sender: userId,
      type: "connection",
      message: `${user.name} accepted your connection request`,
    });

    res.status(200).json({
      success: true,
      message:
        "Connection request accepted",
    });
  } catch (error) {
    console.error(
      "Accept connection request error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to accept connection request",
      error: error.message,
    });
  }
};

// ==========================================
// REJECT CONNECTION REQUEST
// ==========================================

const rejectConnectionRequest = async (
  req,
  res
) => {
  try {
    const userId = req.user.userId;

    const requesterId =
      req.params.id ||
      req.params.requestId;

    if (!requesterId) {
      return res.status(400).json({
        success: false,
        message:
          "Requester ID is required",
      });
    }

    const user =
      await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check request exists
    const requestExists =
      user.connectionRequests.some(
        (id) =>
          id.toString() ===
          requesterId.toString()
      );

    if (!requestExists) {
      return res.status(400).json({
        success: false,
        message:
          "No connection request from this user",
      });
    }

    // Remove request
    user.connectionRequests =
      user.connectionRequests.filter(
        (id) =>
          id.toString() !==
          requesterId.toString()
      );

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Connection request rejected",
    });
  } catch (error) {
    console.error(
      "Reject connection request error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to reject connection request",
      error: error.message,
    });
  }
};

// ==========================================
// GET CONNECTION REQUESTS
// ==========================================

const getConnectionRequests = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(req.user.userId)
        .select("connectionRequests")
        .populate(
          "connectionRequests",
          "name email profilePic banner bio skills role"
        );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      requests:
        user.connectionRequests || [],
    });
  } catch (error) {
    console.error(
      "Get connection requests error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to get connection requests",
      error: error.message,
    });
  }
};

// ==========================================
// GET CONNECTIONS
// ==========================================

const getConnections = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(req.user.userId)
        .select(
          "connections connectionRequests"
        )
        .populate(
          "connections",
          "name email profilePic banner bio skills role"
        )
        .populate(
          "connectionRequests",
          "name email profilePic banner bio skills role"
        );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      connections:
        user.connections || [],
      connectionRequests:
        user.connectionRequests || [],
    });
  } catch (error) {
    console.error(
      "Get connections error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to get connections",
      error: error.message,
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getConnectionRequests,
  getConnections,
};