const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "../public")));

app.get("/api/test", (req, res) => {
  console.log(req.headers);
  console.log(req.socket.remoteAddress);
  res.json({
    headers: req.headers,
    remoteAddress: req.socket.remoteAddress,
  });
});

io.on("connection", (socket) => {
  console.log("New websocket connection");

  socket.on("join", (userInfo, callback) => {
    const { error, user } = addUser({ id: socket.id, ...userInfo });
    if (error) return callback(error);

    socket.join(user.room);
    socket.emit("message", generateMessage("Admin", "Welcome to " + user.room));
    io.to(user.room).emit(
      "message",
      generateMessage("Admin", `${user.username} joined room!`)
    );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }
    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback();
  });

  socket.on("sendLocation", (location, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        location,
        `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
      )
    );
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} left the chat romm!`)
      );

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
});

// chat app
// https://chat-rooms-creator.herokuapp.com/
