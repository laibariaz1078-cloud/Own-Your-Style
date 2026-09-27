import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  userId:
  // foreignKey 
   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["shipping", "billing", "both"], default: "shipping" },
  recipientName: { type: String, required: true },
  company: String,
  line1: { type: String, required: true },
  line2: String,
  city: { type: String, required: true },
  state: String,
  postalCode: { type: String, required: true },
  countryCode: { type: String, required: true, uppercase: true },
  phone: String,
  isDefaultShipping: { type: Boolean, default: false },
  isDefaultBilling: { type: Boolean, default: false },
}, { timestamps: true });

// Pehle filter karte ho ek specific userId se
// Phir uske results ko createdAt ke hisaab se sort karte ho (newest first)
AddressSchema.index({ userId: 1, createdAt: -1 });

// Agar Address model pehle se bana hua hai (mongoose.models.Address) → wahi use karo
// Warna naya bana lo (mongoose.model("Address", AddressSchema))
export default mongoose.models.Address || mongoose.model("Address", AddressSchema);