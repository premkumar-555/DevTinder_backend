const express = require("express");
const { userAuth } = require("../middlewares/auth");
const profileRouter = express.Router();
const User = require("../models/user");
const {
  validateProfileEditPayload,
  checkChangePasswordPayload,
} = require("../middlewares/profile");

// GET /profile/view
profileRouter.get("/view", userAuth, async (req, res) => {
  try {
    // access userInfo from request object and respond same
    const user = req?.userInfo;
    return res.status(200).json({ data: user });
  } catch (err) {
    console.log(`Err @ get /profile : ${JSON.stringify(err)}`);
    return res
      .status(500)
      .send(`ERROR : ${err.message || "Something went wrong!"}`);
  }
});

// PATCH - /profile/edit
profileRouter.patch(
  "/edit",
  userAuth,
  validateProfileEditPayload,
  async (req, res) => {
    try {
      // edit and respond back with latest updated user
      const user = req?.userInfo;
      const updatedUser = await User.findByIdAndUpdate(user?._id, req?.body, {
        runValidators: true,
        returnDocument: "after",
      });
      console.log("user profile udpated successful!");
      res.status(200).json({
        data: updatedUser,
        message: "User profile udpated successfully!",
      });
    } catch (err) {
      console.log(`Err @ /profile/edit : ${JSON.stringify(err)} `);
      return res.status(500).send(err?.message || `Something went wrong!`);
    }
  }
);

// PATCH - /profile/change/password
profileRouter.patch(
  "/change/password",
  userAuth,
  checkChangePasswordPayload,
  async (req, res) => {
    try {
      // hash new password and save in db
      const user = req?.userInfo;
      user.password = await user.getHashedPassword(req.body?.newPassword);
      await user.save();
      console.log("Password change is successful!");
      return res
        .status(200)
        .json({ message: "Password Changed Successfully!" });
    } catch (err) {
      console.log(`Err @ /profile/change/password : ${JSON.stringify(err)} `);
      return res.status(500).send(err?.message || `Something went wrong!`);
    }
  }
);

module.exports = profileRouter;
