import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  uid: { type: String, unique: true, index: true },
  email: { type: String, index: true },
  role: { type: String, enum: ["admin","operator","viewer","user"], default: "user" }
}, { timestamps: true });
export default mongoose.model("User", userSchema);
