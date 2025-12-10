const { isObjectIdOrHexString } = require("mongoose");

const isValidObjectId = (objId) => isObjectIdOrHexString(objId);

const INTERESTED = "interested";

module.exports = {
  isValidObjectId,
  INTERESTED,
};
