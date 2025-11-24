const express = require("express");
const app = express();
const connectDB = require("./config/database");
const User = require("./models/user");
const port = 3000;

// to transform json request to normal js object form
app.use(express.json());

// user signup api
app.post("/signup", async (req, res) => {
  try {
    // creating a new user instance using user model
    const user = new User(req.body);
    await user.save();
    console.log(`User signup is successful!`);
    return res.status(200).send("User signup is successful!");
  } catch (err) {
    console.log(`Err @ user signup : ${JSON.stringify(err)}`);
    return res
      .status(500)
      .send(err.message || "Something went wrong at user signup!");
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
