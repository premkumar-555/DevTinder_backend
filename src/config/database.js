// getting-started.js
const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://premuhulikoppe_db_user:4Pu2WRnWaB5t2muC@cluster0.jpvvdan.mongodb.net/?appName=Cluster0/dev_tinder"
  );
};

module.exports = connectDB;
