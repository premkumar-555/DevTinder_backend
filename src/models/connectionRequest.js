const mongoose = require("mongoose");
const { isLowercase, trim } = require("validator");

// create connectionRequestSchema
const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
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
