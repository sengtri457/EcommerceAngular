require("dotenv").config();
const mongoose = require("mongoose");

const connection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MONGO_URI:", process.env.MONGO_URI);
    console.log("Data Base Connection suscessfull");
  } catch (err) {
    console.log(`cannot connection : ${err}`);
  }
};
connection();
