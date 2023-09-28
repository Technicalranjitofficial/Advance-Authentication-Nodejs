import mongoose from "mongoose";
require("dotenv").config();

const dbUrl = process.env.DB_URL || "";

export const connectDB = async () => {
  try {
    await mongoose.connect(dbUrl).then(() => {
      console.log("Connected to database");
    });
  } catch (error) {
    console.log("Error connecting to database", error);
  }
};
