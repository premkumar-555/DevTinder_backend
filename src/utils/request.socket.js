const { normalizeObjectIds, INTERESTED } = require("./common");
const UserModel = require("../models/user");
const RequestModel = require("../models/connectionRequest");

// Handle Edgecases and return to user info back
const checkUsersIdentity = async (toUserId, socket) => {
  try {
    // 1. Check users identity
    const userIds = normalizeObjectIds([socket?.userInfo?._id, toUserId]);
    const users = await UserModel.find({
      _id: { $in: [...userIds] },
    })
      .select(["_id", "firstName", "lasName"])
      .lean(true);
    if (users?.length !== 2) {
      return socket.emit("error", "Unauthorized users!");
    }
    // 2. Check whether valid connection request exists with interested status
    const conReq = await RequestModel.findOne(
      {
        fromUserId: socket?.userInfo?._id,
        toUserId,
        status: INTERESTED,
      },
      { _id: 1 }
    );
    if (!conReq) {
      return socket.emit("error", "Invalid socket request!");
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

// Event handlers for '/requests' channel
const requestsNameSpaceSetup = (io, authMiddleware) => {
  try {
    // 1.Init namespace
    const requestNameSpace = io.of("/requests");
    // 2. Register auth middleware
    requestNameSpace.use(authMiddleware);
    // 3. Listen events
    requestNameSpace.on("connection", (socket) => {
      console.log(`socket : ${socket?.id} connected to request socket channel`);

      // listen any new connection request
      socket.on("sendConnectionRequest", async (toUserId) => {
        // 1. Auth checks on userIds
        await checkUsersIdentity(toUserId, socket);

        // 2. Emit connectioRequest event to all sockets except sender
        socket.broadcast.emit("receiveConnectionRequest", {
          toUserId,
          fromUserInfo: socket?.userInfo,
        });
      });

      socket.on("acceptRequest", async (toUserId) => {
        // 1. Auth checks on userIds
        await checkUsersIdentity(toUserId, socket);

        // 2. Emit connectioRequest event to all sockets except sender
        socket.broadcast.emit("requestAccepted", {
          toUserId,
          fromUserInfo: socket?.userInfo,
        });
      });
    });

    // 4. Listen disconneciton from clients
    requestNameSpace.on("disconnect", () => {
      console.log(`Socket : ${socket.id}, disconnected`);
    });
  } catch (err) {
    console.log("Error at requestsNameSpaceSetup : ", err?.message);
  }
};

module.exports = {
  requestsNameSpaceSetup,
};
