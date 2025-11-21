const express = require("express");
const app = express();
const port = 3000;
const { adminAuth, userAuth } = require("./middlewares/auth");

app.use("/admin", adminAuth);

app.get("/admin", (req, res) => {
  console.log(`Entered admin/fetch`);
  res.send("Sending admin data");
});

app.post("/admin/create", (req, res) => {
  console.log(`Entered admin/create`);
  res.send("Created admin data!");
});

app.get("/users", userAuth, (req, res, next) => {
  console.log(`Route handler 1`);
  res.send("Sending users data !");
});

app.post("/users/create", (req, res, next) => {
  console.log(`Route handler 2`);
  res.send("Created users data !");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
