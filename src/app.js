const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/database");
const port = 3000;
const routers_array = require("./routes/routers");

// Enable CORS
app.use(
  cors({
    origin: "http://localhost:5173", // Allow only a specific origin
    credentials: true, // Enable cookies and credentials
  })
);

// to transform json request to normal js object form
app.use(express.json());

// parse cookies head and populate req.cookies
app.use(cookieParser());

// registering routes with respective controllers, on application
if (routers_array?.length > 0) {
  routers_array?.forEach(({ path, controller }) => {
    // assure both path & controller, before initialize
    if (!!path && !!controller) {
      app.use(path, controller);
    }
  });
}

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
