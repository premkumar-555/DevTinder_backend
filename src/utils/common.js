const { isObjectIdOrHexString } = require("mongoose");

const isValidObjectId = (objId) => isObjectIdOrHexString(objId);

module.exports = {
  isValidObjectId,
};
