import mongoose from "mongoose";

const RegistrationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  collegeName: { type: String, required: true },
  course: { type: String, required: true },
  transactionId: { type: String, unique: true },
  events: { type: [String], required: true },
  eventDetails: { type: Object, required: true },
  totalAmount: { type: Number, required: true },
}, { timestamps: true }); // Automatically adds createdAt & updatedAt timestamps

export const UserSchema = mongoose.model("User", RegistrationSchema);   