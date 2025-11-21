const adminAuth = (req, res, next) => {
  console.log(`Entered admin auth middleware!`);
  const token = "xyz";
  const adminAuthorized = token === "xyz";
  if (!adminAuthorized) {
    return res.status(401).send("Admin unauthorized!");
  } else {
    next();
  }
};

const userAuth = (req, res, next) => {
  console.log(`Entered user auth middleware!`);
  const token = "xyz";
  const userAuthorized = token === "xyz";
  if (!userAuthorized) {
    return res.status(401).send("User unauthorized!");
  } else {
    next();
  }
};

module.exports = {
  adminAuth,
  userAuth,
};
