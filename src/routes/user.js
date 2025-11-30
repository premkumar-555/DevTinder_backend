const express = require("express");
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");
const userRouter = express.Router();

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
    ).populate("fromUserId", [
      "firstName",
      "lastName",
      "age",
      "gender",
      "about",
      "skills",
    ]);
    res.status(200).send({ data: conReqs });
  } catch (err) {
    console.log(`Err @  /user/requests/received : ${JSON.stringify(err)}`);
    return res
      .status(500)
      .send(`ERROR : ${err?.message || "Something went wrong!"}`);
  }
});

module.exports = userRouter;
