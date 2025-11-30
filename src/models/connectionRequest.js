const mongoose = require("mongoose");
const { isLowercase, trim } = require("validator");

// create connectionRequestSchema
const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    status: {
      type: String,
      required: true,
      isLowercase: true,
      trim: true,
      enum: {
        values: ["interested", "ignored", "accepted", "rejected"],
        message: `Unsupported status type {VALUE}! `,
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * creating a compoung index on fields fromUserId & toUserId
 * creating indexes is good for development but not feasible for production
 * as if db under heavy write ops index builds on updates will impact db performance
 * which leads write ops very slow due to respective index builds so we should not alow this in prod
 * we need to do index builds during write peak-off maintainance downtime period like night or can follow other methods
 */

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

/**
 * Check fromUserId ===  toUserId (Not allow user to create request to himself)
 * a) If fromUserId & toUserId are equal then deny creation of request
 * b) else allow for creation
 */
connectionRequestSchema.pre("save", function () {
  const { fromUserId, toUserId } = this;
  // checking fromUserId === toUserId
  if (fromUserId.equals(toUserId)) {
    throw new Error("User shouldn't send connection request to himself!");
  }
});

const connectionRequestModel = new mongoose.model(
  "connection_request",
  connectionRequestSchema
);

module.exports = connectionRequestModel;
