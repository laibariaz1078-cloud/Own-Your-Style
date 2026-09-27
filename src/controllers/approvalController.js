import mongoose from "mongoose";
import ApprovalRequest from "../models/ApprovalRequest";
import Category from "../models/Category";
import Product from "../models/Product";
import User from "../models/User";
import Notification from "../models/Notification";

export async function createApprovalRequest({ userId, operation, entityType, targetId, payload }) {
  const existing = await ApprovalRequest.findOne({ requestedBy: userId, operation, entityType, targetId: targetId || null, status: "pending" });
  if (existing) return existing;
  const request = await ApprovalRequest.create({ requestedBy: userId, operation, entityType, targetId: targetId || null, payload: payload || {} });
  const seller = await User.findById(userId).select("firstName lastName storeName").lean();
  const sellerName = [seller?.firstName, seller?.lastName].filter(Boolean).join(" ") || seller?.storeName || "A seller";
  const label = `${operation} ${entityType}`;
  const admins = await User.find({ role: "admin", status: "active" }).select("_id").lean();
  if (admins.length) {
    await Notification.insertMany(admins.map((admin) => ({
      recipient: admin._id,
      type: "approval_request",
      title: "Approval required",
      message: `${sellerName} submitted a ${label} request.`,
      approvalRequestId: request._id,
    })));
  }
  return request;
}

export async function applyApprovalRequest(request, adminId) {
  const Model = request.entityType === "product" ? Product : Category;
  let result;
  if (request.operation === "create") {
    result = await Model.create(request.payload);
  } else if (request.operation === "update") {
    if (!mongoose.isValidObjectId(request.targetId)) throw new Error("Target not found");
    result = await Model.findByIdAndUpdate(request.targetId, request.payload, { new: true, runValidators: true });
  } else {
    result = await Model.findByIdAndDelete(request.targetId);
  }
  if (request.operation !== "create" && !result) throw new Error("Target not found");
  request.status = "approved";
  request.reviewedBy = adminId;
  request.reviewedAt = new Date();
  await request.save();
  await Notification.create({
    recipient: request.requestedBy,
    type: "approval_update",
    title: "Request approved",
    message: `Your ${request.operation} ${request.entityType} request was approved.`,
    approvalRequestId: request._id,
  });
  return result;
}
