const mongoose = require("mongoose");
const {
  NEW_MESSAGE,
  NEW_REQUEST,
  REQUEST_ACCEPTED,
} = require("../utils/common");

// notification schema
const notificationSchema = new mongoose.Schema(
  {
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    toUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      required: true,
      enum: [NEW_MESSAGE, NEW_REQUEST, REQUEST_ACCEPTED],
    },
    info: { type: String, reqired: true },
    status: {
      type: String,
      required: true,
      enum: ["pending", "delivered"],
    },
  },
  { timestamps: true }
);

module.exports = new mongoose.model("notification", notificationSchema);
