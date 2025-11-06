import mongoose from "mongoose";

const lookupSchema = new mongoose.Schema({
  ip: String,
  city: String,
  region: String,
  country: String,
  latitude: Number,
  longitude: Number,
  org: String,
  timezone: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Lookup || mongoose.model("Lookup", lookupSchema);
