const express = require("express");
const { userAuth } = require("../middlewares/auth");
const profileRouter = express.Router();
const User = require("../models/user");

// GET user profile api
profileRouter.get("/", userAuth, async (req, res) => {
  try {
    // access userInfo from request object and respond same
    const user = req?.userInfo;
    return res.status(200).send(user);
  } catch (err) {
    console.log(`Err @ get /profile : ${JSON.stringify(err)}`);
    return res
      .status(500)
      .send(`ERROR : ${err.message || "Something went wrong!"}`);
  }
});

module.exports = profileRouter;
