const express = require("express");
const app = express();
const port = 3000;
let users = [
  { _id: Date.now() + 1, name: "Ram Pothineni" },
  { _id: Date.now() + 2, name: "Anand Dongare" },
];

app.use(express.json());

app.get("/users", (req, res) => {
  return res.send(users);
});

app.post("/users", (req, res) => {
  console.log("req?.body :", req?.body);
  if (!!req?.body && Object.values(req?.body)?.length > 0) {
    users.push({ _id: Date.now(), ...req?.body });
    console.log("users :", JSON.stringify(users));
    return res.send({
      msg: "successfully created user",
      userId: users[users.length - 1]?._id,
    });
  } else {
    return res.send("Invalid request body!");
  }
});

app.put("/users/:id", (req, res) => {
  let msg = `user not found!`;
  if (!!req?.body && Object.values(req?.body)?.length > 0 && req?.params?.id) {
    users.forEach((el, ind) => {
      if (el?._id === +req?.params?.id) {
        users[ind] = { ...users[ind], ...req?.body };
        msg = "successfully updated user";
        console.log("updated user :");
      }
    });
    return res.send(msg);
  } else {
    return res.send("Invalid request body or param id!");
  }
});

app.delete("/users/:id", (req, res) => {
  let msg = `user not found!`;
  if (req?.params?.id) {
    users = users.filter((el) => {
      if (el?._id !== +req?.params?.id) {
        return true;
      } else {
        msg = `successfully deleted user`;
        console.log(msg);
        return false;
      }
    });

    console.log("users :", JSON.stringify(users));
    return res.send(msg);
  } else {
    return res.send("Invalid request body or param id!");
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
