import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  description: String,
  imageUrl: String,
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  path: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  level: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  seo: { title: String, description: String },
}, { timestamps: true });

CategorySchema.index({ parentId: 1, sortOrder: 1 });
export default mongoose.models.Category || mongoose.model("Category", CategorySchema);