import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema({
  emailId: {
    type: String,
    // required: true,
    unique: true,
  },
  to: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["PENDING", "SENT", "FAILED", "RETRIED", "FALLBACK_USED"],
    default: "PENDING",
  },
  retryCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  providerUsed: {
    type: String,
    required: false,
    default: null,
  },
  errorMessage: {
    type: String,
    required: false,
  },
  
});

export const EmailLog = mongoose.model("EmailLog", emailLogSchema);
