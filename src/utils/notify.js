const {
  PENDING,
  NEW_MESSAGE,
  NEW_REQUEST,
  onlineUsers,
  REQUEST_ACCEPTED,
  NEW_NOTIFICATION,
  DELIVERED,
} = require("./common");
const NotificationModel = require("../models/notifications");

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
      socketIO.to(`user:${toUserId}`).emit(NEW_NOTIFICATION, {
        type,
        fromUser: { _id, firstName, lastName },
        info,
      });
    } else {
      const newNotification = new NotificationModel({
        fromUserId: _id,
        toUserId,
        type,
        info,
        status: PENDING,
      });
      await newNotification.save();
      console.log(`Successfully saved new notification message item.`);
    }
    return true;
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

// To process and send pending notifications to user when he is online
const processPendingNofifications = async (socketIO, toUserId) => {
  try {
    // 1. fetch pending notifications from db to toUserId
    const pendingNotifications = await NotificationModel.find({
      toUserId,
      status: PENDING,
    })
      .populate({
        path: "fromUserId",
        select: ["_id", "firstName", "lastName"],
      })
      .select(["_id", "fromUserId", "type", "info"])
      .lean();
    if (pendingNotifications?.length > 0) {
      for await (const {
        fromUserId: fromUser,
        info: message,
        ...remains
      } of pendingNotifications) {
        const payload = {
          ...remains,
          fromUser: { _id: fromUser?._id?.toString(), ...fromUser },
          toUserId,
          message,
        };
        const notifiedResponse = await processNotifyItem(socketIO, payload);
        console.log(
          `Deliver notification : ${payload?._id?.toString()}, to user : ${toUserId} is ${
            notifiedResponse ? "success" : "failed"
          }`
        );
      }
    }
    return true;
  } catch (err) {
    console.log(
      `Error @ sendPendingNofifications: ${JSON.stringify(err)}, ${
        err?.message
      }`
    );
  }
};

// To process pending notification message items
const processNotifyItem = (socketIO, payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      // send notification
      const notifyResponse = await sendNotification(socketIO, payload);
      // update notification status as 'delivered'
      if (notifyResponse) {
        const updateRes = await NotificationModel.findByIdAndUpdate(
          payload?._id,
          { status: DELIVERED },
          {
            runValidators: true,
            returnDocument: "after",
          }
        );
      }
      resolve(true);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  sendNotification,
  processPendingNofifications,
};
