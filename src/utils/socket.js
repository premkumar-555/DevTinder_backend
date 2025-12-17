const { Server } = require("socket.io");
const JWT = require("jsonwebtoken");
const UserModel = require("../models/user");
const ChatModel = require("../models/chat");
const { isValidObjectId } = require("./common");
const { default: mongoose } = require("mongoose");

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
    console.log(`Socket ${socket.id} connected to server`);

    // function to broadcast messages to chat room
    const broadCastMessage = (roomId, data) => {
      // check to deny broadcast
      const isInvalid =
        !roomId ||
        !data ||
        !["toUserId", "message"].every((key) => !!data[key]);
      if (isInvalid) {
        return;
      }
      // else emit message to room
      io.to(roomId).emit("receiveMessage", {
        fromUser: socket.userInfo,
        message: data.message,
        createdAt: new Date().toUTCString(),
      });
    };

    // To Fetch and update chat messages
    const getChatID = async (toUserId, eventName = "", message = "") => {
      try {
        // 1. Find chat exists or not
        const normalObjectIds = normalizeObjectIds([
          socket?.userInfo?._id,
          toUserId,
        ]);
        let chat = await ChatModel.findOne({
          participants: { $all: [...normalObjectIds] },
        });
        // a) If no chat, create new one at 'joinRoom' event as it emit first
        if (!chat && eventName === "joinRoom") {
          chat = new ChatModel({
            participants: [...normalObjectIds],
            messages: [],
          });
        }
        // b) update chat on new messages
        if (chat && eventName === "sendMessage" && !!message) {
          chat.messages.push({
            fromUser: socket?.userInfo?._id,
            message,
          });
        }
        await chat.save();
        const roomId = chat._id.toString();
        return roomId;
      } catch (err) {
        console.log(
          `Error @ chatUpdateBroadcast : ${JSON.stringify(
            err
          )}, error message : ${err?.message}`
        );
        return socket.emit("error", err?.message || "Something went wrong!");
      }
    };

    // Handle joining a room for chat
    socket.on("joinRoom", async (toUserId) => {
      try {
        // 1. Verify users identity from db
        const normalObjectIds = normalizeObjectIds([
          socket?.userInfo?._id,
          toUserId,
        ]);
        const usersCount = await UserModel.countDocuments({
          _id: { $in: [...normalObjectIds] },
        }).select("id");
        if (usersCount !== 2) {
          return socket.emit("error", "Invalid users!");
        }
        // 2. fetch roomId
        const roomId = await getChatID(toUserId, "joinRoom");
        // 3. Join socket to room
        socket.join(roomId);
        console.log(`Socket : ${socket.id}, joined room`);
      } catch (err) {
        console.log(
          `Error @ joinRoom, socket : ${socket.id}, err : ${JSON.stringify(
            err
          )}, message : ${err?.message}`
        );
        return socket.emit("error", err?.message || "Something went wrong!");
      }
    });

    // Handle sending messages
    socket.on("sendMessage", async ({ toUserId, message }) => {
      const roomId = await getChatID(toUserId, "sendMessage", message);
      broadCastMessage(roomId, { toUserId, message });
    });

    socket.on("disconnect", () => {
      console.log(`Socket : ${socket.id}, disconnected`);
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

// Normalize user ids to mongo objectIds
const normalizeObjectIds = (ids) => {
  return ids
    ?.filter(isValidObjectId)
    ?.map((id) => new mongoose.Types.ObjectId(id));
};

module.exports = initializeSocket;
