const authRouter = require("./auth");
const profileRouter = require("./profile");
const requestRouter = require("./request");
const userRouter = require("./user");

/**
 * storing all routers with respective controllers in an array of objects
 * to register routes on server application dynamically
 * assure order of routes while updating array for further upgrades.
 */
const routers_array = [
  { path: "/auth", controller: authRouter },
  { path: "/profile", controller: profileRouter },
  { path: "/request", controller: requestRouter },
  { path: "/user", controller: userRouter },
];

module.exports = routers_array;
