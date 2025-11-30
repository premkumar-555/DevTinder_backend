const express = require("express");
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");
const userRouter = express.Router();

const SELECTIVE_REF_FIELDS = [
  "firstName",
  "lastName",
  "age",
  "gender",
  "about",
  "skills",
];

// GET /user/review/requests/received : fetch connection requests received
userRouter.get("/requests/received", userAuth, async (req, res) => {
  try {
    // Edge cases
    // 1. To fetch connection requests, loggedInUser should be toUserId of request
    // 2. Connection request status should be 'interested'
    const loggedInUser = req.userInfo;
    const conReqs = await ConnectionRequest.find(
      {
        toUserId: loggedInUser._id,
        status: "interested",
      },
      { toUserId: 0, status: 0, __v: 0 }
    ).populate("fromUserId", SELECTIVE_REF_FIELDS);
    res.status(200).send({ data: conReqs });
  } catch (err) {
    console.log(`Err @  /user/requests/received : ${JSON.stringify(err)}`);
    return res
      .status(500)
      .send(`ERROR : ${err?.message || "Something went wrong!"}`);
  }
});

// GET /user/connections : fetch all user connections
userRouter.get("/connections", userAuth, async (req, res) => {
  try {
    // Edge cases
    // 1. loggedInUser may be either sender or receiver of the request
    // 2. connection request should be in 'accepted' status
    // 3. Response data must be users list other than loggedInUser
    const loggedInUser = req.userInfo;
    let conReqs = await ConnectionRequest.find(
      {
        $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
        status: "accepted",
      },
      { fromUserId: 1, toUserId: 1 }
    )
      .populate({
        path: "fromUserId",
        match: { _id: { $ne: loggedInUser._id } }, // Join condition on ref document
        as: "user",
        select: SELECTIVE_REF_FIELDS,
      })
      .populate({
        path: "toUserId",
        match: { _id: { $ne: loggedInUser._id } }, // Join condition on ref document
        select: SELECTIVE_REF_FIELDS,
      });
    if (conReqs?.length > 0) {
      conReqs = conReqs.map(({ fromUserId, toUserId }) =>
        fromUserId && fromUserId?._id ? fromUserId : toUserId
      );
    }
    return res.status(200).send({ data: conReqs });
  } catch (err) {
    console.log(`Err @  /user/connections : ${JSON.stringify(err)}`);
    return res
      .status(500)
      .send(`ERROR : ${err?.message || "Something went wrong!"}`);
  }
});

module.exports = userRouter;
