const { isObjectIdOrHexString, default: mongoose } = require("mongoose");

const isValidObjectId = (objId) => isObjectIdOrHexString(objId);

// Normalize user ids to mongo objectIds
const normalizeObjectIds = (ids) => {
  return ids
    ?.filter(isValidObjectId)
    ?.map((id) => new mongoose.Types.ObjectId(id));
};

const INTERESTED = "interested";

module.exports = {
  isValidObjectId,
  INTERESTED,
  normalizeObjectIds,
};
