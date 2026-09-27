const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

const senderId = "6ab7cbf5a6a9518645e79c99";
const receiverId = "6ab7d026c4c77d72fd6ad393";

socket.on("connect", () => {
  console.log("Connected to Socket.IO server");
  console.log("Socket ID:", socket.id);

  socket.emit("joinRoom", senderId);

  console.log(`Joined room: ${senderId}`);

  setTimeout(() => {
    socket.emit("sendMessage", {
      sender: senderId,
      receiver: receiverId,
      content: "Hello from real-time Socket.IO!",
    });

    console.log("Real-time message sent");
  }, 1000);
});

socket.on("receiveMessage", (message) => {
  console.log("Received message:");
  console.log(message);
});

socket.on("disconnect", () => {
  console.log("Disconnected from Socket.IO server");
});