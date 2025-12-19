const express = require("express");
const { createServer } = require("http");
const app = express();
const httpServer = createServer(app);
const cookieParser = require("cookie-parser");
const cors = require("cors");
// Enabling dotenv config at very first to load env variables
require("dotenv").config();

const connectDB = require("./config/database");
const port = process.env.PORT;
const routers_array = require("./routes/routers");
const initializeSocket = require("./utils/socket");

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
    httpServer.listen(port, () => {
      console.log(`Server listening on port ${port}`);
      // Initialize Socket.io for real-time communication
      initializeSocket(httpServer);
      // Initiating cron jobs
      require("./cronJobs/main.cron");
    });
  })
  .catch((err) => {
    console.log(`Failed to connect database, err : ${JSON.stringify(err)}`);
  });
