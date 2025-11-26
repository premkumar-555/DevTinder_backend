const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const { isObjectIdOrHexString } = require("mongoose");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const connectDB = require("./config/database");
const User = require("./models/user");
const { validateSignupData, validateLoginData } = require("./middlewares/user");
const { userAuth } = require("./middlewares/auth");
const port = 3000;
const privateKey = "DevTinder@1551";

// to transform json request to normal js object form
app.use(express.json());

// parse cookies head and populate req.cookies
app.use(cookieParser());

// user signup api
app.post("/signup", validateSignupData, async (req, res) => {
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
    return res.status(200).send("User signup is successful!");
  } catch (err) {
    console.log(`Err @ user signup : ${JSON.stringify(err)}`);
    return res
      .status(500)
      .send(`ERROR : ${err.message || "Something went wrong!"}`);
  }
});

app.post("/login", validateLoginData, async (req, res) => {
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
    return res.status(200).send("User login is successful!");
  } catch (err) {
    console.log(`Err @ user login : ${JSON.stringify(err)}`);
    return res
      .status(500)
      .send(`ERROR : ${err.message || "Something went wrong!"}`);
  }
});

// GET user /profile
app.get("/profile", userAuth, async (req, res) => {
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

// POST /sendConnectionRequest
app.post("/sendConnectionRequest", userAuth, async (req, res) => {
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

// first connect to db then start server application
connectDB()
  .then(() => {
    console.log(`Connected to database successfully`);
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.log(`Failed to connect database, err : ${JSON.stringify(err)}`);
  });
