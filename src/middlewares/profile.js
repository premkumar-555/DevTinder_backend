const validator = require("validator");

// validate /profil/edit payload
const validateProfileEditPayload = (req, res, next) => {
  try {
    // check for allowed edit fields
    const allowedEditFields = [
      "firstName",
      "lastName",
      "gender",
      "age",
      "about",
      "skills",
      "profileUrl",
    ];
    const isEditAllowed = Object.keys(req.body).every((field) =>
      allowedEditFields.includes(field)
    );
    if (!isEditAllowed) {
      console.log(`user profile edit is not allowed!`);
      return res.status(400).send(`Invalid Edit Request!`);
    }
    // validate optional edit fields values
    const { firstName, lastName, gender, age, about, skills, profileUrl } =
      req.body;
    if (!!firstName && !validator.isAlpha(firstName?.trim())) {
      console.log(
        `Invalid profile edit field firstName!`,
        firstName?.trim(),
        " ",
        validator.isAlpha(firstName?.trim())
      );
      return res.status(400).send(`Invalid firstname!`);
    }
    if (!!lastName && !validator.isAlpha(lastName?.trim())) {
      console.log(`Invalid profile edit field lastName!`);
      return res.status(400).send(`Invalid lastname`);
    }
    if (
      !!gender &&
      !["male", "female", "others"]?.includes(gender?.trim()?.toLowerCase())
    ) {
      console.log(`Invalid profile edit field gender!`);
      return res.status(400).send(`Invalid gender!`);
    }
    if (validator.isNumeric(`${age}`) && age < 18) {
      console.log(`Invalid profile edit field age!`);
      return res.status(400).send(`Minimum age should be 18!`);
    }
    if (!!about && about?.trim()?.length > 100) {
      console.log(`Invalid profile edit field about!`);
      return res
        .status(400)
        .send(`about shouldn'\t exceed maximum of 100 characters!`);
    }
    if (Array.isArray(skills) && skills?.length > 5) {
      console.log(`Invalid profile edit field skills!`);
      return res.status(400).send(`Maximum 5 skills are allowed!`);
    }
    if (!!profileUrl && !validator.isURL(profileUrl?.trim())) {
      console.log(`Invalid profile edit field profileUrl!`);
      return res.status(400).send(`Invalid profile url!`);
    }
    next();
  } catch (err) {
    console.log(`Err @ validateProfileEditPayload : ${JSON.stringify(err)} `);
    return res.status(500).send(err?.message || `Something went wrong!`);
  }
};

module.exports = {
  validateProfileEditPayload,
};
