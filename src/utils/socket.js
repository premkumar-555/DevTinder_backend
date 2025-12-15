const { Server } = require("socket.io");
const JWT = require("jsonwebtoken");
const UserModel = require("../models/user");

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  // validate auth on each socket connection
  io.use(socketAuthMiddleware);

  // Listen and handle socket connections
  io.on("connection", (socket) => {
    // Handle joining a room for chat
    socket.on("joinRoom", (toUserId) => {
      // create unique room ID based on user IDs
      const roomId = getUniqueRoomId([socket?.userInfo?._id, toUserId]);
      socket.join(roomId);
      console.log(`Socket ${socket.id}, joined room: ${roomId}`);
    });

    // Handle sending messages
    socket.on("sendMessage", ({ toUserId, message }) => {
      // broadcast message to all clients in the room
      const roomId = getUniqueRoomId([socket?.userInfo?._id, toUserId]);
      io.to(roomId).emit("receiveMessage", {
        from: socket.userInfo,
        toUserId,
        message,
      });
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

// Auth middleware for socket connections
const socketAuthMiddleware = async (socket, next) => {
  try {
    console.log("[..socketAuthMiddleware invoked..]");
    // verify token from socket.handshake.auth
    const token = socket?.handshake?.auth?.token;
    if (!token) {
      return next(new Error("Authentication error : No token provided!"));
    }
    // validate token
    const decode = await JWT.verify(token, process.env.JWT_PRIVATE_KEY);
    if (!decode) {
      return next(new Error("Authentication error : authentication denied!"));
    }
    // verify user identity in db
    const user = await UserModel.findById(decode?.id)
      .select(["firstName", "lastName", "profileUrl"])
      .lean();
    if (!user) {
      return next(new Error("Authentication error : invalid user!"));
    }
    user.name = `${user.firstName} ${user.lastName}`;
    ["firstName", "lastName"].forEach((field) => delete user[field]);
    socket.userInfo = user;
    next();
  } catch (err) {
    console.log(
      `Socket auth error : ${JSON.stringify(err)}, error message : ${
        err?.message
      }`
    );
    return next(new Error("Authentication error : authentication denied!"));
  }
};

const getUniqueRoomId = (users) => {
  return users.sort().join("_");
};
module.exports = initializeSocket;
