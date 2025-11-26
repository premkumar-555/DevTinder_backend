const validator = require("validator");

// validate user signup data
const validateSignupData = async (req, res, next) => {
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
    res.status(400).send(`ERROR : ${err?.message || "Something went wrong!"}`);
  }
};

module.exports = {
  validateSignupData,
};
