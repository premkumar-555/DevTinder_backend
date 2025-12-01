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
        match: { _id: { $ne: loggedInUser._id } }, // match conditions on ref document fields
        select: SELECTIVE_REF_FIELDS,
        transform: function (doc, id) {
          return doc === null ? id : doc;
        },
      })
      .populate({
        path: "toUserId",
        match: { _id: { $ne: loggedInUser._id } }, // match conditions on ref document fields
        select: SELECTIVE_REF_FIELDS,
        transform: function (doc, id) {
          return doc === null ? id : doc;
        },
      });
    if (conReqs?.length > 0) {
      conReqs = conReqs.map(({ fromUserId, toUserId }) =>
        fromUserId?.toString() !== loggedInUser?._id.toString()
          ? fromUserId
          : toUserId
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

// GET /user/feed : api to fetch and feed users data to loggedInuser
userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    // Edge cases to fetch and feed users to loggedInUser
    // 1. Except loggedInUser, all users should be shown.
    /** 2. Except users, who already have a connection having status of either
     * [interested, ignored, accepted, rejected] with current loggedInUser,
     * all users should be shown.
     * */
    const loggedInUser = req.userInfo;
    // fetch all users with whom loggedInUser having connections in any status
    const connections = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    })
      .populate({
        path: "fromUserId",
        match: {
          _id: { $ne: loggedInUser._id }, // populate if not loggedInUser
        },
        select: "_id",
      })
      .populate({
        path: "toUserId",
        match: {
          _id: { $ne: loggedInUser._id }, // populate if not loggedInUser
        },
        select: "_id",
      })
      .select(["fromUserId", "toUserId"]);
    // extract not required userIds
    const avoidUserIds = connections?.map(({ fromUserId, toUserId }) =>
      fromUserId && fromUserId?._id ? fromUserId._id : toUserId._id
    );
    // include loggedInUserId also in avoidUserIds array
    avoidUserIds.push(loggedInUser._id);
    const users = await User.find({
      _id: { $nin: avoidUserIds },
    }).select(SELECTIVE_REF_FIELDS);
    return res.status(200).send({ data: users });
  } catch (err) {
    console.log(`Err @  /user/feed : ${JSON.stringify(err)}`);
    return res
      .status(500)
      .send(`ERROR : ${err?.message || "Something went wrong!"}`);
  }
});

module.exports = userRouter;
