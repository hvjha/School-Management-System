import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import FinePayment from "../../../models/library/payFineModel.js";

export const fineReceipt = asyncHandler(async (req, res) => {
  const { receiptId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(receiptId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid receiptId",
    });
  }

  const receipt = await FinePayment.findById(receiptId)
    .populate("student", "name email")
    .populate({
      path: "issues",
      populate: { path: "book", select: "title isbn" },
    })
    .populate("collectedBy", "name email");

  if (!receipt) {
    return res.status(404).json({
      success: false,
      message: "Receipt not found",
    });
  }

  // 🔐 student can view only own receipt
  if (
    req.user.role === "student" &&
    receipt.student._id.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  res.status(200).json({
    success: true,
    receipt,
  });
});
