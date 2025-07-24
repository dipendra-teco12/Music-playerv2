const mongoose = require("mongoose");
require("dotenv").config({ quiet: true });
const uri = process.env.MONGO_URI;
const connectDB = async () => {
  try {
    const connect = await mongoose.connect(`${uri}`);

    console.log(`mongdb connected ${connect.connection.host} `);
  } catch (error) {
    console.log(`mongodb connection failed`);
    process.exit(1);
  }
};

module.exports = connectDB;
