import mongoose from "mongoose";

const VendorMessageSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: { type: String, enum: ["admin", "vendor"], required: true },
    message: { type: String, required: true, trim: true, maxlength: 4000 },
  },
  { timestamps: true }
);

VendorMessageSchema.index({ vendorId: 1, createdAt: 1 });

export default mongoose.models.VendorMessage || mongoose.model("VendorMessage", VendorMessageSchema);
