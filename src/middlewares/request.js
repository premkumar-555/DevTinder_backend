const { isObjectIdOrHexString } = require("mongoose");
const User = require("../models/user");

// checkCreateConnectionReqParams : validate request params
const checkCreateConnectionReqParams = async (req, res, next) => {
  try {
    // validate request params
    const { status, toUserId } = req.params;

    // 1. Check allowed status values  [interested, ignore]
    const allowedStatus = ["interested", "ignored"];
    if (!allowedStatus.includes(status?.trim()?.toLowerCase())) {
      return res
        .status(400)
        .send({ message: `Unsupported status value ${status}!` });
    }

    // 2. check toUserId as valid objectId, and respective user exists in our db
    if (!isObjectIdOrHexString(toUserId)) {
      return res.status(400).send({ message: `Invalid toUserId ${toUserId}!` });
    }

    // check toUserId identity
    const toUser = await User.findOne({ _id: toUserId }, { _id: 1 });
    if (!toUser) {
      return res.status(400).send({ message: `Invalid toUserId ${toUserId}!` });
    }
    next();
  } catch (err) {
    console.log(
      `Err @  checkCreateConnectionReqParams : ${JSON.stringify(err)}`
    );
    return res
      .status(500)
      .send(`ERROR : ${err.message || "Something went wrong!"}`);
  }
};

module.exports = {
  checkCreateConnectionReqParams,
};
