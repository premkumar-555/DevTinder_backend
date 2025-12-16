const chatRouter = require("express").Router();
const { userAuth } = require("../middlewares/auth");
const { validateChatViewPayload } = require("../middlewares/chat");
const ChatModel = require("../models/chat");
const { isValidObjectId } = require("../utils/common");

// Route to get chat of users
chatRouter.post(
  "/view",
  userAuth,
  validateChatViewPayload,
  async (req, res) => {
    try {
      // Edge Cases:
      // 1. Fetch chat for users from db
      let chat = await ChatModel.findOne({
        participants: { $all: [req.userInfo._id, ...req.body.users] },
      }).populate({
        path: "messages.fromUser",
        select: ["firstName", "lastName", "profileUrl"],
      });
      // a) If chat not exists, create new one for users
      if (!chat) {
        chat = new ChatModel({
          participants: [req.userInfo._id, ...req.body.users],
          messages: [],
        });
        await chat.save();
      }
      // b) else respond the existing chat
      // exclude unnecessary fields before sending response
      chat = chat.toObject();
      ["__v", "participants"].forEach((field) => delete chat[field]);
      return res.status(200).json({ data: chat });
    } catch (err) {
      console.log(`Err @ /chat/view : ${JSON.stringify(err)}`);
      return res
        .status(500)
        .send(`ERROR : ${err?.message || "Something went wrong!"}`);
    }
  }
);

module.exports = chatRouter;
