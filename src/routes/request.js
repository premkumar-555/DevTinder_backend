const express = require("express");
const { userAuth } = require("../middlewares/auth");
const requestRouter = express.Router();
const User = require("../models/user");

// POST - send connection request api
requestRouter.post("/sendConnectionRequest", userAuth, async (req, res) => {
  try {
    return res
      .status(200)
      .send(req?.userInfo?.firstName + " send connection request!");
  } catch (err) {
    console.log(`Err @  /sendConnectionRequest : ${JSON.stringify(err)}`);
    return res
      .status(500)
      .send(`ERROR : ${err.message || "Something went wrong!"}`);
  }
});

module.exports = requestRouter;
