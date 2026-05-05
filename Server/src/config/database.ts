import mongoose from "mongoose";
import "dotenv/config";

const DATABASE_URL = process.env.DATABASE_URL || "";
if (!DATABASE_URL) {
  throw new Error("Please provide a database URL");
}

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(DATABASE_URL, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`🛰️  MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("DB connection error:", err);
  }
};
