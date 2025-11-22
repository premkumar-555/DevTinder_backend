const express = require("express");
const app = express();
const connectDB = require("./config/database");
const port = 3000;

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
