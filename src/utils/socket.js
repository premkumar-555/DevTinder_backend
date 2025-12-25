const { Server } = require("socket.io");
const JWT = require("jsonwebtoken");
const UserModel = require("../models/user");
const ChatModel = require("../models/chat");
const ConReqModel = require("../models/connectionRequest");
const { normalizeObjectIds, NEW_MESSAGE } = require("./common");
const { sendNotification, processPendingNofifications } = require("./notify");
const { onlineUsers } = require("./common");
// global socketIO variablue to reuse
let io = null;

// Auth middleware for socket connections
const socketAuthMiddleware = async (socket, next) => {
  try {
    console.log("[..socketAuthMiddleware invoked..]");
    // verify token from socket.handshake.auth
    const token = socket?.handshake?.auth?.token;
    console.log("socketAuthMiddleware, token exists ", !!token);
    if (!token) {
      return socket.emit("error", "Authentication error : No token provided!");
    }
    // validate token
    const decode = await JWT.verify(token, process.env.JWT_PRIVATE_KEY);
    if (!decode) {
      return socket.emit(
        "error",
        "Authentication error : authentication denied!"
      );
    }
    // verify user identity in db
    const user = await UserModel.findById(decode?.id)
      .select(["firstName", "lastName", "profileUrl"])
      .lean(true);
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

// Handle validations at socket join & socket messaging
// 1. users should be valid users
// 2. users should have connection with each other to chat
const checkUsersIdentity = async (toUserId, socket) => {
  try {
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
    // check connected users
    const connection = await ConReqModel.findOne({
      $or: [
        { fromUserId: normalObjectIds[0], toUserId: normalObjectIds[1] },
        { fromUserId: normalObjectIds[1], toUserId: normalObjectIds[0] },
      ],
    }).select("_id");
    if (!connection) {
      return socket.emit("error", "Invalid users!");
    }
  } catch (err) {
    console.log(
      `Error @ checkUsersIdentity : ${JSON.stringify(err)}, error message : ${
        err?.message
      }`
    );
    return socket.emit("error", err?.message || "Something went wrong!");
  }
};

const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  // validate auth on each socket connection
  io.use(socketAuthMiddleware);

  // Listen and handle socket connections
  io.on("connection", (socket) => {
    console.log(`Socket ${socket.id} connected to server`);
    // On socket connection, join socket to its user id room
    const socketUserId = socket?.userInfo?._id?.toString() || "";

    socket.join(`user:${socketUserId}`);

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
        const normalObjectIds = normalizeObjectIds([socketUserId, toUserId]);
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
            fromUser: socketUserId,
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

    // IMP** : on successful socket connection store userId in onlineUsers map
    if (!onlineUsers.has(socketUserId)) {
      onlineUsers.set(socketUserId, new Set([socket.id]));
      // At first socket connection emit 'userOnline' event to all clients
      socket.broadcast.emit("userOnline", { userId: socketUserId });
    } else {
      // If already a loged in user store respective socket id
      onlineUsers.get(socketUserId).add(socket.id);
    }

    // on successful user socket client connection,
    // process pending notifications if any
    processPendingNofifications(io, socketUserId)
      .then((res) => {
        console.log(
          `socket : ${socket.id}, process pending notifications response : ${res}`
        );
      })
      .catch((err) => {
        console.log(
          `Err @ processPendingNofifications : ${JSON.stringify(
            err
          )}, error message : ${err?.message}`
        );
      });

    // To get online users
    socket.on("getOnlineUsers", (userIds) => {
      const usersOnline = userIds?.filter((id) =>
        onlineUsers.has(id.toString())
      );
      // emit 'onlineUsers' event to client
      socket.emit("onlineUsers", usersOnline);
    });

    // Handle joining a room for chat
    socket.on("joinRoom", async (toUserId) => {
      try {
        // 1. Verify users identity
        await checkUsersIdentity(toUserId, socket);
        // 2. fetch roomId
        const roomId = await getChatID(toUserId, "joinRoom");
        // 3. Join socket to room
        if (socket.rooms.has(roomId)) {
          console.log(`Socket ${socket.id} is already in room ${roomId}`);
        } else {
          socket.join(roomId);
          console.log(`Socket : ${socket.id}, joined room`);
        }
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
      // 1. Verify users identity
      await checkUsersIdentity(toUserId, socket);
      // 2. Get room Id
      const roomId = await getChatID(toUserId, "sendMessage", message);
      // 3. Broadcast message
      broadCastMessage(roomId, { toUserId, message });
      // 4. On new message, send notification
      const payload = {
        fromUser: socket?.userInfo,
        toUserId,
        type: NEW_MESSAGE,
        message,
      };
      sendNotification(io, payload);
    });

    // Handle user typing event
    socket.on("typing", async (toUserId) => {
      // 1. Verify users identity
      await checkUsersIdentity(toUserId, socket);
      // 2. Get room Id
      const roomId = await getChatID(toUserId, "sendMessage");
      // 3. Broadcast message except current typing user
      socket.to(roomId).emit("receiveTyping");
    });

    // Disconnect all socket connections on user logout
    socket.on("logOut", () => {
      // clear socket's userInfo
      delete socket?.userInfo;
      // make all Socket instances that are currently connected on the given node disconnect
      socket.disconnect();
    });

    socket.on("disconnect", () => {
      console.log(`Socket : ${socket.id}, disconnected`);

      // Handling user offline feature on socket disconnection
      // 1. If user online clear socket id
      if (onlineUsers.has(socketUserId)) {
        onlineUsers.get(socketUserId).delete(socket.id);
        // If all sockets disconnected clear userId from onlineUsers map
        if (onlineUsers.get(socketUserId)?.size === 0) {
          onlineUsers.delete(socketUserId);
          // emit userOffline event to all clients
          socket.broadcast.emit("userOffline", { userId: socketUserId });
        }
      }
    });
  });
};

// get io
const getIO = () => (!!io ? io : {});

module.exports = {
  initializeSocket,
  getIO,
};
