const validator = require("validator");

// validate /profile/edit payload
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
      return res.status(400).send({ message: `Invalid Edit Request!` });
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
      return res.status(400).send({ message: `Invalid firstname!` });
    }
    if (!!lastName && !validator.isAlpha(lastName?.trim())) {
      console.log(`Invalid profile edit field lastName!`);
      return res.status(400).send({ message: `Invalid lastname!` });
    }
    if (
      !!gender &&
      !["male", "female", "others"]?.includes(gender?.trim()?.toLowerCase())
    ) {
      console.log(`Invalid profile edit field gender!`);
      return res.status(400).send({ message: `Invalid gender!` });
    }
    if (validator.isNumeric(`${age}`) && age < 18) {
      console.log(`Invalid profile edit field age!`);
      return res.status(400).send({ message: `Minimum age should be 18!` });
    }
    if (!!about && about?.trim()?.length > 100) {
      console.log(`Invalid profile edit field about!`);
      return res.status(400).send({
        message: `about shouldn'\t exceed maximum of 100 characters!`,
      });
    }
    if (Array.isArray(skills) && skills?.length > 5) {
      console.log(`Invalid profile edit field skills!`);
      return res.status(400).send({ message: `Maximum 5 skills are allowed!` });
    }
    if (!!profileUrl && !validator.isURL(profileUrl?.trim())) {
      console.log(`Invalid profile edit field profileUrl!`);
      return res.status(400).send({ messsage: `Invalid profile url!` });
    }
    next();
  } catch (err) {
    console.log(`Err @ validateProfileEditPayload : ${JSON.stringify(err)} `);
    return res
      .status(500)
      .send({ message: err?.message || `Something went wrong!` });
  }
};

// validate /profile/change/password
const checkChangePasswordPayload = async (req, res, next) => {
  try {
    // check requirements
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword?.trim()) {
      return res.status(400).send({ message: `old password is required!` });
    }
    if (!newPassword?.trim()) {
      return res.status(400).send({ message: `new password is required!` });
    }
    // check both passwords strength
    if (!validator.isStrongPassword(oldPassword?.trim())) {
      return res.status(400).send({ message: `Invalid old password!` });
    }
    if (!validator.isStrongPassword(newPassword?.trim())) {
      return res.status(400).send({ message: `Invalid new password!` });
    }
    // check new_password !== old_password
    if (newPassword?.trim() === oldPassword?.trim()) {
      return res
        .status(400)
        .send({ messsage: `Input passwords should not be same!` });
    }
    // check new_password !== user.password
    const user = req?.userInfo;
    const isNewPasswordMatched = await user.verifyLoginPassword(newPassword);
    if (isNewPasswordMatched) {
      console.log(
        `checkChangePasswordPayload, new password is matched with user password`
      );
      return res
        .status(400)
        .send(`New password shouldn'\t be same as old saved password!`);
    }
    // check old_password === user.password
    const isOldPasswordMatched = await user.verifyLoginPassword(oldPassword);
    if (!isOldPasswordMatched) {
      console.log(`checkChangePasswordPayload, old password is invalid!`);
      return res.status(400).send({ messsage: `Incorrect old password!` });
    }
    next();
  } catch (err) {
    console.log(`Err @ checkChangePasswordPayload : ${JSON.stringify(err)} `);
    return res.status(500).send(err?.message || `Something went wrong!`);
  }
};

module.exports = {
  validateProfileEditPayload,
  checkChangePasswordPayload,
};
