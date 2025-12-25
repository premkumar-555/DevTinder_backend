const { isObjectIdOrHexString, default: mongoose } = require("mongoose");

const isValidObjectId = (objId) => isObjectIdOrHexString(objId);

// Normalize user ids to mongo objectIds
const normalizeObjectIds = (ids) => {
  return ids
    ?.filter(isValidObjectId)
    ?.map((id) => new mongoose.Types.ObjectId(id));
};

const INTERESTED = "interested";
const ACCEPTED = "accepted";
const PENDING = "pending";
const DELIVERED = "delivered";
const NEW_MESSAGE = "newMessage";
const NEW_REQUEST = "newRequest";
const REQUEST_ACCEPTED = "requestAccepted";
const NEW_NOTIFICATION = "newNotification";

// In-memory cache to store online userIds along with their socketIds
const onlineUsers = new Map();

module.exports = {
  isValidObjectId,
  INTERESTED,
  PENDING,
  DELIVERED,
  NEW_MESSAGE,
  NEW_REQUEST,
  REQUEST_ACCEPTED,
  normalizeObjectIds,
  onlineUsers,
  ACCEPTED,
  NEW_NOTIFICATION,
};
