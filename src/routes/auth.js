const express = require("express");
const {
  validateSignupData,
  validateLoginData,
} = require("../middlewares/auth");
const authRouter = express.Router();
const User = require("../models/user");

// POST - auth signup api
authRouter.post("/signup", validateSignupData, async (req, res) => {
  try {
    // extract req body payload
    const { firstName, lastName, emailId, password } = req.body;
    // creating a new user instance using user model
    const user = new User({
      firstName,
      lastName,
      emailId,
    });
    // encrypt password before saving to db
    user.password = await user.getHashedPassword(password);
    await user.save();
    console.log(`User signup is successful!`);
    return res.status(200).json({ message: "User signup is successful!" });
  } catch (err) {
    console.log(`Err @ user signup : ${JSON.stringify(err)}`);
    return res
      .status(500)
      .send(`ERROR : ${err.message || "Something went wrong!"}`);
  }
});

// POST - auth login api
authRouter.post("/login", validateLoginData, async (req, res) => {
  try {
    // extract emailId and password
    const { emailId, password } = req.body;
    // check user exists for provided emailId
    const user = await User.findOne({ emailId }, { password: 1 });
    if (!user) {
      // don't explicitly inform about invalid fields
      return res.status(400).send("ERROR : Invalid credentials!");
    }
    // verify password
    const isValidPassword = await user.verifyLoginPassword(password);
    if (!isValidPassword) {
      // don't explicitly inform about invalid fields
      return res.status(400).send("ERROR : Invalid credentials!");
    }

    // generate auth token and set on res cookies for authentication
    const authToken = await user.getJWTToken();
    console.log("User logged in is successfully!");
    // set auth token on cookies
    res.cookie("token", authToken, {
      // cookie will be removed after 1day
      expires: new Date(Date.now() + 24 * 3600000),
    });
    return res.status(200).json({ message: "User login is successful!" });
  } catch (err) {
    console.log(`Err @ user login : ${JSON.stringify(err)}`);
    return res
      .status(500)
      .send(`ERROR : ${err.message || "Something went wrong!"}`);
  }
});

// POST - auth logout api
authRouter.post("/logout", (req, res) => {
  // Clear the cookie 'id' at client
  res
    .clearCookie("token")
    .status(200)
    .json({ message: "User logged out successfully!" });
  console.log("User logged out successfull!");
});

module.exports = authRouter;
