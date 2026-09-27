import mongoose from "mongoose";

const ApprovalRequestSchema = new mongoose.Schema(
  {
    operation: { type: String, enum: ["create", "update", "delete"], required: true },
    entityType: { type: String, enum: ["product", "category"], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, default: null },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: { type: String, enum: ["pending", "approved", "dismissed", "cancelled"], default: "pending" },
    reviewNote: { type: String, default: "" },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ApprovalRequestSchema.index({ status: 1, createdAt: -1 });
ApprovalRequestSchema.index({ requestedBy: 1, status: 1, createdAt: -1 });

export default mongoose.models.ApprovalRequest || mongoose.model("ApprovalRequest", ApprovalRequestSchema);
