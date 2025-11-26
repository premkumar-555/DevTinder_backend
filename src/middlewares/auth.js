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

module.exports = {
  userAuth,
};
