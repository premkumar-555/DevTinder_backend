const {
  PENDING,
  NEW_MESSAGE,
  NEW_REQUEST,
  onlineUsers,
  REQUEST_ACCEPTED,
} = require("./common");

// To get notification message info based on type
const getMessageInfo = (type, message = "", fromUserName) => {
  let info = "";
  switch (type) {
    case NEW_MESSAGE:
      info = `${message.substring(0, 50)}...`;
      break;
    case NEW_REQUEST:
      info = `Received new request from ${fromUserName}!`;
      break;
    case REQUEST_ACCEPTED:
      info = `${fromUserName} accepted your request!`;
      break;
  }
  return info;
};

// send notifications
const sendNotification = async (socketIO, payload) => {
  if (!socketIO) {
    return;
  }
  try {
    const notificationModel = require("../models/notifications");
    const {
      fromUser: { _id, firstName, lastName },
      toUserId,
      type,
      message,
    } = payload;
    const fromUserName = `${firstName} ${lastName}`;
    // emit notification to toUserId room if online,
    // else store in db
    const info = getMessageInfo(type, message, fromUserName);
    if (onlineUsers.has(toUserId)) {
      socketIO.to(`user:${toUserId}`).emit("newNotification", {
        type,
        fromUser: { _id, firstName, lastName },
        info,
      });
    } else {
      const newNotification = new notificationModel({
        fromUserId: _id,
        toUserId,
        type,
        info,
        status: PENDING,
      });
      await newNotification.save();
      console.log(`Successfully saved new notification message item.`);
    }
  } catch (err) {
    console.log(
      `Error @ sendNotification : ${JSON.stringify(err)}`,
      err?.message
    );
    return socketIO
      ?.to(payload?.fromUser?._id)
      .to(payload?.toUserId)
      .emit("error", err?.message || "something went wrong!");
  }
};

module.exports = {
  sendNotification,
};
