import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["approval_request", "approval_update"], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    approvalRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "ApprovalRequest", default: null },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, readAt: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
