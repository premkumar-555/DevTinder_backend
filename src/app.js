const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const connectDB = require("./config/database");
const User = require("./models/user");
const { isObjectIdOrHexString } = require("mongoose");
const { validateSignupData } = require("./middlewares/user");
const port = 3000;

// to transform json request to normal js object form
app.use(express.json());

// user signup api
app.post("/signup", validateSignupData, async (req, res) => {
  try {
    // extract req body payload
    const { firstName, lastName, emailId, password } = req.body;

    // encrypt password before saving to db
    const hashedPassword = await bcrypt.hash(password, 10);

    // creating a new user instance using user model
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
    });
    await user.save();
    console.log(`User signup is successful!`);
    return res.status(200).send("User signup is successful!");
  } catch (err) {
    console.log(`Err @ user signup : ${JSON.stringify(err)}`);
    return res.status(500).send(err.message || "Something went wrong!");
  }
});

// GET user by emailId
app.get("/user", async (req, res) => {
  try {
    const user = await User.findOne({ emailId: req.body.emailId });
    if (!user) {
      return res.status(404).send("User not found!");
    } else {
      return res.send(user);
    }
  } catch (err) {
    console.log(`Err @ get user by emailId : ${JSON.stringify(err)}`);
    return res.status(500).send(err.message || "Something went wrong!");
  }
});

// GET feed API - get all users from db
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    if (users.length === 0) {
      return res.status(404).send("No users exist!");
    } else {
      return res.send(users);
    }
  } catch (err) {
    console.log(`Err @ feed users : ${JSON.stringify(err)}`);
    return res.status(500).send(err.message || "Something went wrong!");
  }
});

// GET user by Id
app.get("/userById/:id", async (req, res) => {
  try {
    // validate the Id
    if (!isObjectIdOrHexString(req.params.id)) {
      return res.status(400).send("Invalid userId!");
    } else {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).send("User not found!");
      } else {
        return res.send(user);
      }
    }
  } catch (err) {
    console.log(`Err @ get userById : ${JSON.stringify(err)}`);
    return res.status(500).send(err.message || "Something went wrong!");
  }
});

// DELETE user by Id
app.delete("/user", async (req, res) => {
  try {
    // validate the Id
    if (!req.body.userId) {
      return res.status(400).send("Please provide userId!");
    } else if (!isObjectIdOrHexString(req.body.userId)) {
      return res.status(400).send("Invalid userId!");
    } else {
      await User.findByIdAndDelete(req.body.userId);
      return res.send("Deleted user successfully!");
    }
  } catch (err) {
    console.log(`Err @ delete user by Id : ${JSON.stringify(err)}`);
    return res.status(500).send(err.message || "Something went wrong!");
  }
});

// UPDATE user by Id
app.patch("/user/:userId", async (req, res) => {
  try {
    // validate the Id
    if (!isObjectIdOrHexString(req.params?.userId)) {
      return res.status(400).send("Invalid userId!");
    }
    // validate allowed update keys eg : update should be denied for emailId
    const ALLOWED_UPDATE_KEYS = [
      "password",
      "age",
      "profileUrl",
      "about",
      "skills",
    ];
    // check for allowed update
    const notAllowedKeys = Object.keys(req.body)?.filter(
      (x) => !ALLOWED_UPDATE_KEYS.includes(x)
    );
    if (!!notAllowedKeys && !!notAllowedKeys?.length) {
      return res
        .status(400)
        .send(
          `Update is not allowed for keys ${JSON.stringify(notAllowedKeys)}!`
        );
    }
    // update and return latest updated user data
    const user = await User.findByIdAndUpdate(req.params?.userId, req.body, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!user) {
      return res.status(404).send("User not found!");
    } else {
      return res.send({ msg: "Updated user successfully", data: user });
    }
  } catch (err) {
    console.log(`Err @ update user by Id : ${JSON.stringify(err)}`);
    return res.status(500).send(err.message || "Something went wrong!");
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
