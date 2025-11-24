const mongoose = require("mongoose");
const regExpns = require("./constants/regExpns");

// user schema
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "firstName is required!"],
    minLength: [4, "Minimum length of firstName should be 4!"],
    maxLength: [12, "Minimum length of firstName should be 12!"],
    cast: "{PATH} value is not a string!",
  },
  lastName: {
    type: String,
    minLength: [4, "Minimum length of lastName should be 4!"],
    maxLength: [12, "Minimum length of lastName should be 12!"],
    cast: "{PATH} value is not a string!",
  },
  emailId: {
    type: String,
    required: [true, "emailId is required!"],
    lowercase: true,
    maxLength: [25, "Minimum length of emailId should be 25!"],
    validate: {
      validator: function (v) {
        return regExpns.email.test(v);
      },
      message: (props) => `${props?.value} is not a valid emailId!`,
    },
    cast: "{PATH} value is not a string!",
  },
  password: {
    type: String,
    required: [true, "password is required!"],
    minLength: [8, "Minimum length of password should be 8!"],
    maxLength: [12, "Minimum length of password should be 12!"],
    validate: {
      validator: function (v) {
        return regExpns.password.test(v);
      },
      message: (props) => `${props?.value} is not a valid password!`,
    },
    cast: "{PATH} value is not a string!",
  },
  gender: {
    type: String,
    required: [true, "gender is required!"],
    lowercase: true,
    enum: {
      values: ["male", "female", "others"],
      message: "{VALUE} is not supported!",
    },
    cast: "{PATH} value is not a string!",
  },
  age: {
    type: Number,
    min: [18, "Minimum age of user should be 18!"],
    cast: "{PATH} value is not a number!",
  },
  profileUrl: {
    type: String,
    default:
      "https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg",
    maxLength: [100, "Minimum length of profileUrl should be 100!"],
    cast: "{PATH} value is not a string!",
  },
});

module.exports = mongoose.model("Users", userSchema);
