import mongoose from "mongoose";

export async function connectDB() {
  try {
    if (mongoose.connection.readyState >= 1) return;
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "ipfinder",
    });
    console.log("MongoDB Connected Successfully ✅✅✅");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
  }
}
