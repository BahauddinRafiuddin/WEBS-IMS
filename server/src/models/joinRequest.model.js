import mongoose from "mongoose";

const joinRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InternshipProgram",
    default: null  
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
    index: true
  },
  message: {
    type: String,
    trim: true,
    maxlength: 500
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Prevent duplicate pending requests from same user to same company
joinRequestSchema.index({ user: 1, company: 1, status: 1 });

export default mongoose.model("JoinRequest", joinRequestSchema);