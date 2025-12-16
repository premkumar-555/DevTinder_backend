const { isValidObjectId } = require("../utils/common");

// To validate /chat/view request payload
const validateChatViewPayload = (req, res, next) => {
  try {
    // validations :
    // 1. req payload validation - check users array
    if (
      !req?.body?.users ||
      !Array.isArray(req.body.users) ||
      req.body.users.length === 0
    ) {
      return res.status(400).send({ message: "Invalid field : users!" });
    }
    // 2. check if users are valid ObjectIds
    const isValidUserIds = req.body.users.every(isValidObjectId);
    if (!isValidUserIds) {
      return res.status(400).send({ message: "Invalid user ids!" });
    }
    next();
  } catch (err) {
    console.log(`Err @ validateChatViewPayload : ${JSON.stringify(err)}`);
    return res
      .status(500)
      .send(`ERROR : ${err?.message || "Something went wrong!"}`);
  }
};

module.exports = {
  validateChatViewPayload,
};
