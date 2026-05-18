import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not set in environment");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    mongoose.set("strictQuery", true);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    // retry connection after delay
    setTimeout(() => connectDB(), 5000);
  }
};

export default connectDB;
