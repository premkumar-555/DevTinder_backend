const validator = require("validator");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const privateKey = "DevTinder@1551";

const userAuth = async (req, res, next) => {
  try {
    // extract auth token from req cookies and verify it
    const { token } = req.cookies;
    if (!token) {
      throw new Error("Invalid token");
    }
    const decoded = await jwt.verify(token, privateKey);
    // check user
    const user = await User.findById(decoded?.id);
    if (!user) {
      throw new Error("User not exists");
    }
    // set user data on request body
    req.userInfo = user;
    next();
  } catch (err) {
    console.log(`Err @ userAuth : ${JSON.stringify(err)}`);
    return res
      .status(400)
      .send(
        `ERROR : ${err.message || "Something went wrong"}, Please login again!`
      );
  }
};

// validate user signup data
const validateSignupData = (req, res, next) => {
  try {
    const { firstName, lastName, emailId, password } = req.body;
    if (!firstName || !lastName) {
      throw new Error("firstname and lastname are required!");
    }
    if (!validator.isAlpha(firstName)) {
      throw new Error("firstname is invalid!");
    }
    if (!validator.isAlpha(lastName)) {
      throw new Error("lastname is invalid!");
    }
    if (!emailId) {
      throw new Error("emailId is requried!");
    }
    if (!validator.isEmail(emailId)) {
      throw new Error("Invalid emailId!");
    }
    if (!password) {
      throw new Error("password is requried!");
    }
    if (!validator.isStrongPassword(password)) {
      throw new Error("Please provide strong password!");
    }
    next();
  } catch (err) {
    console.log(`Err @ validateSignupData : ${JSON.stringify(err)}`);
    res.status(400).send(`ERROR : ${err?.message || "Something went wrong!"}`);
  }
};

// validate user login data
const validateLoginData = (req, res, next) => {
  try {
    // check emailId & password
    const { emailId, password } = req.body;
    if (!emailId) {
      throw new Error("emailId is required!");
    }
    if (!password) {
      throw new Error("password is required!");
    }
    if (!validator.isEmail(emailId)) {
      throw new Error("Invalid emailId!");
    }
    if (!validator.isStrongPassword(password)) {
      throw new Error("Please provide strong password!");
    }
    next();
  } catch (err) {
    console.log(`Err @ validateLoginData : ${JSON.stringify(err)}`);
    res.status(400).send(`ERROR : ${err?.message || "Something went wrong!"}`);
  }
};

module.exports = {
  userAuth,
  validateSignupData,
  validateLoginData,
};
