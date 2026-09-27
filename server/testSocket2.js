const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

const userId = "6ab7d026c4c77d72fd6ad393";

socket.on("connect", () => {
  console.log("User 2 connected");
  console.log("Socket ID:", socket.id);

  socket.emit("joinRoom", userId);

  console.log(`User 2 joined room: ${userId}`);
});

socket.on("receiveMessage", (message) => {
  console.log("REAL-TIME MESSAGE RECEIVED:");
  console.log(message);
});

socket.on("disconnect", () => {
  console.log("User 2 disconnected");
});