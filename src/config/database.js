// getting-started.js
const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://premuhulikoppe_db_user:4Pu2WRnWaB5t2muC@cluster0.jpvvdan.mongodb.net/dev_tinder_db"
  );
};

module.exports = connectDB;
