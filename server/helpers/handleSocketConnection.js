function handleSocketConnection(io) {
  io.on("connection", (socket) => {
    console.log(socket.id, " connected!!");
    socket.on("joinRoom", (train_id) => {
      socket.join(train_id);
    });
    socket.on("updateSeatsReq", (train_id, updates) => {
      io.to(train_id).emit("updateSeatsEvent", updates);
    });
    socket.on("updateSeatsEvent", (updates) => {
      socket.emit("seatUpdates", updates);
    });
  });
}
module.exports = handleSocketConnection;
