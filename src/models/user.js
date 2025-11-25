const mongoose = require("mongoose");
const regExpns = require("./constants/regExpns");

// user schema
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "firstName is required!"],
    trim: true,
    minLength: [4, "Minimum length of firstName should be 4!"],
    maxLength: [12, "Maximum length of firstName should be 12!"],
    // to customize type casting error message
    cast: "'{PATH}' value is not a valid string!",
    match: [regExpns.text, "{PATH} is invalid!"],
  },
  lastName: {
    type: String,
    trim: true,
    minLength: [4, "Minimum length of lastName should be 4!"],
    maxLength: [12, "Maximum length of lastName should be 12!"],
    cast: "'{PATH}' value is not a valid string!",
    match: [regExpns.text, "{PATH} is invalid!"],
  },
  emailId: {
    type: String,
    unique: true,
    required: [true, "emailId is required!"],
    trim: true,
    lowercase: true,
    maxLength: [25, "Maximum length of emailId should be 25!"],
    // validate: {
    //   validator: function (v) {
    //     return regExpns.email.test(v);
    //   },
    //   message: (props) => `${props?.value} is not a valid emailId!`,
    // },
    match: [regExpns.email, "{PATH} is invalid!"],
    cast: "'{PATH}' value is not a valid string!",
  },
  password: {
    type: String,
    required: [true, "password is required!"],
    trim: true,
    minLength: [8, "Minimum length of password should be 8!"],
    maxLength: [12, "Maximum length of password should be 12!"],
    // validate: {
    //   validator: function (v) {
    //     return regExpns.password.test(v);
    //   },
    //   message: (props) => `${props?.value} is not a valid password!`,
    // },
    match: [regExpns.password, "{PATH} is invalid!"],
    cast: "'{PATH}' value is not a valid string!",
  },
  gender: {
    type: String,
    required: [true, "gender is required!"],
    trim: true,
    lowercase: true,
    enum: {
      values: ["male", "female", "others"],
      message: "{VALUE} is not a supported gender!",
    },
    cast: "'{PATH}' value is not a valid string!",
  },
  age: {
    type: Number,
    min: [18, "Minimum age of user should be 18!"],
    cast: "'{PATH}' value is not a valid number!",
  },
  profileUrl: {
    type: String,
    trim: true,
    default:
      "https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg",
    maxLength: [100, "Maximum length of profileUrl should be 100!"],
    cast: "'{PATH}' value is not a valid string!",
    match: [regExpns.url, "{PATH} is invalid!"],
  },
  about: {
    type: String,
    trim: true,
    maxLength: [50, "Maximum length of '{PATH}' should be 50!"],
    cast: "'{PATH}' value is not a valid string!",
  },
  skills: {
    type: [String],
    validate: {
      validator: (v) => v?.length <= 5,
      message: (props) => `${props?.path} shouldn't be more than 5!`,
    },
  },
});

module.exports = mongoose.model("Users", userSchema);
