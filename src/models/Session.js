import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    userAgent: String,
    ipAddress: String,
    deviceName: String,
    isRevoked: { type: Boolean, default: false },
    revokedAt: Date,
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

SessionSchema.index({ userId: 1, isRevoked: 1, expiresAt: 1 });

export default mongoose.models.Session || mongoose.model("Session", SessionSchema);
