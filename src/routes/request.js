const express = require("express");
const { userAuth } = require("../middlewares/auth");
const requestRouter = express.Router();
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");
const { checkCreateConnectionReqParams } = require("../middlewares/request");

// POST - /request/send/:status/:toUserId - status : [interested, ignore]
requestRouter.post(
  "/send/:status/:toUserId",
  userAuth,
  checkCreateConnectionReqParams,
  async (req, res) => {
    try {
      /**
       * Check edge cases before creation of connection request, eg: fromUserId, toUserId
       * 1. Check connection request already exists containing users as 'fromUserId' and 'toUserId'
       * a) fromUserId ==> toUserId OR toUserId ==> fromUserId (only one connection request should be allowed between two unique users)
       * b) If exists deny creation request, else continue further
       */
      const fromUserId = req?.userInfo || "";
      const { status, toUserId } = req.params;
      const request = await ConnectionRequest.findOne(
        {
          $or: [
            { fromUserId, toUserId },
            { fromUserId: toUserId, toUserId: fromUserId },
          ],
        },
        { _id: 1 }
      );
      if (request) {
        console.log(`connection request already exists!`);
        return res
          .status(400)
          .send({ message: "Connection request already exists!" });
      }

      /* 
      2. Check fromUserId ===  toUserId (Not allow user to create request to himself)
       * a) If fromUserId & toUserId are equal then deny creation of request
       * b) else allow for creation finally (logic will be handled before saving by connectionRequestSchema middleware .pre())
       */

      // create connection request
      const conReq = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });
      await conReq.save();
      console.log("Connection request created successfully");
      return res.status(200).send({
        data: conReq,
        message: "Connection request created successfully!",
      });
    } catch (err) {
      console.log(`Err @  /send/:status/:toUserId : ${JSON.stringify(err)}`);
      return res
        .status(500)
        .send(`ERROR : ${err.message || "Something went wrong!"}`);
    }
  }
);

module.exports = requestRouter;
