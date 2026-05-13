import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
     try {
          const connectionInstance = await mongoose.connect(
               `${process.env.MONGODB_URI}/${process.env.DB_NAME}`
          );
          console.log(`✅ MongoDB connected: ${connectionInstance.connection.host}`);
     } catch (error) {
          // Log full stack for easier debugging and DO NOT exit the process so we can inspect runtime errors during development
          console.error("❌ MongoDB connection failed:", error && (error.stack || error));
          // Return false to indicate failure; caller (Server.js) can decide how to proceed
          return false;
     }
};

export default connectDB;
