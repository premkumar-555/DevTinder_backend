const { isValidObjectId } = require("../utils/common");
const User = require("../models/user");

// checkCreateConnectionReqParams : validate request params
const checkCreateConnectionReqParams = async (req, res, next) => {
  try {
    // validate request params
    const { status, toUserId } = req.params;

    // 1. Check allowed status values  [interested, ignore]
    const allowedStatus = ["interested", "ignored"];
    if (!allowedStatus.includes(status)) {
      return res
        .status(400)
        .send({ message: `Unsupported status value ${status}!` });
    }

    // 2. check toUserId as valid objectId, and respective user exists in our db
    if (!isValidObjectId(toUserId)) {
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
      .send(`ERROR : ${err?.message || "Something went wrong!"}`);
  }
};

// checkReviewRequestParams : Validate request parameters
const checkReviewRequestParams = (req, res, next) => {
  try {
    const { status, requestId } = req.params;
    // 1. status should be out of [accepted, rejected]
    const allowedStatus = ["accepted", "rejected"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).send({ message: `Invalid status : ${status}!` });
    }
    // 2. requestId should be valid mongo objectId
    if (!isValidObjectId(requestId)) {
      return res
        .status(400)
        .send({ message: `Invalid requestId : ${requestId}!` });
    }
    next();
  } catch (err) {
    console.log(`Err @  checkReviewRequestParams : ${JSON.stringify(err)}`);
    return res
      .status(500)
      .send(`ERROR : ${err?.message || "Something went wrong!"}`);
  }
};

module.exports = {
  checkCreateConnectionReqParams,
  checkReviewRequestParams,
};
