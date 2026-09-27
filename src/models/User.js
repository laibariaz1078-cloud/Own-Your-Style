import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, sparse: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "seller", "vendor", "buyer", "customer"], default: "buyer" },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", default: null },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    suspensionType: { type: String, enum: ["none", "permanent", "temporary"], default: "none" },
    suspendedUntil: { type: Date, default: null },
    suspensionReason: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    storeName: { type: String, default: "" },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
