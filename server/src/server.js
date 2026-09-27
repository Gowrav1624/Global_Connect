const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Make Socket.IO available globally
// so controllers can emit real-time events.
global.io = io;

// Also make it available through Express
app.set("io", io);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User joins their personal room
  socket.on("joinRoom", (userId) => {
    if (!userId) {
      return;
    }

    socket.join(userId.toString());

    console.log(
      `User ${userId} joined room`
    );
  });

  // Real-time messaging
  socket.on("sendMessage", (message) => {
    try {
      if (!message) {
        return;
      }

      const {
        sender,
        receiver,
        content,
      } = message;

      if (!sender || !receiver || !content) {
        return;
      }

      // Send message to receiver
      io.to(receiver.toString()).emit(
        "receiveMessage",
        {
          sender,
          receiver,
          content,
        }
      );

      // Send real-time notification
      io.to(receiver.toString()).emit(
        "newNotification",
        {
          type: "message",
          sender,
          message:
            "You received a new message",
        }
      );
    } catch (error) {
      console.error(
        "Socket message error:",
        error.message
      );
    }
  });

  socket.on("disconnect", () => {
    console.log(
      "User disconnected:",
      socket.id
    );
  });
});

// Connect MongoDB
connectDB();

// Start server
server.listen(PORT, () => {
  console.log(
    `Global_Connect server running on port ${PORT}`
  );
});