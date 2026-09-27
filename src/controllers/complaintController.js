import { connectToDatabase } from "../lib/mongodb";
import Complaint from "../models/Complaint";

export async function createComplaint(data) {
  await connectToDatabase();

  const complaint = await Complaint.create({
    userId: data.userId,
    sellerId: data.sellerId,
    productId: data.productId,
    orderId: data.orderId,
    title: data.title,
    description: data.description,
    category: data.category || "product",
    priority: data.priority || "medium",
    status: "open",
  });

  return complaint;
}

export async function getComplaintsForUser(user) {
  await connectToDatabase();

  const query = { userId: user._id };
  return Complaint.find(query).sort({ createdAt: -1 }).lean();
}

export async function getComplaintsForSeller(sellerId) {
  await connectToDatabase();

  return Complaint.find({ sellerId }).sort({ createdAt: -1 }).lean();
}

export async function getAllComplaints() {
  await connectToDatabase();

  return Complaint.find({}).sort({ createdAt: -1 }).lean();
}

export async function updateComplaintStatus(id, status, resolutionNote) {
  await connectToDatabase();

  return Complaint.findByIdAndUpdate(
    id,
    {
      status,
      resolutionNote: resolutionNote || "",
      updatedAt: new Date(),
    },
    { new: true }
  );
}

export async function deleteComplaint(id) {
  await connectToDatabase();

  return Complaint.findByIdAndDelete(id);
}
