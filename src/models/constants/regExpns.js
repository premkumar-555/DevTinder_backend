const regExpns = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  /**
   * password validation breakdown
   * Ensures at least one lowercase letter.
   * Ensures at least one uppercase letter.
   * Ensures at least one digit.
   * Ensures at least one special character.
   * Ensures the password is at least 8 characters long.
   */
  password:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/,
};

module.exports = regExpns;
