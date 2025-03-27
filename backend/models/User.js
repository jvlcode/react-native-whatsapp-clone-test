import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  name: { type: String },
  profileImage: { type: String }, // ✅ Ensure this field exists
});

export default mongoose.model("User", UserSchema);
