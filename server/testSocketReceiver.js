const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

const receiverId = "6ab7d026c4c77d72fd6ad393";

socket.on("connect", () => {
  console.log("Receiver connected to Socket.IO server");
  console.log("Receiver Socket ID:", socket.id);

  socket.emit("joinRoom", receiverId);

  console.log(`Receiver joined room: ${receiverId}`);
});

socket.on("receiveMessage", (message) => {
  console.log("Real-time message received:");
  console.log(message);
});

socket.on("disconnect", () => {
  console.log("Receiver disconnected from Socket.IO server");
});