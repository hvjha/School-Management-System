import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import bookIssueModel from "../../../models/library/bookIssueModel.js";

export const payFine = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { issueIds, paymentMode, transactionId } = req.body;

    if (!Array.isArray(issueIds) || issueIds.length === 0) {
      throw new Error("issueIds[] required");
    }

    if (!["cash", "online"].includes(paymentMode)) {
      throw new Error("Invalid payment mode");
    }

    const issues = await bookIssueModel.find({
      _id: { $in: issueIds },
      fine: { $gt: 0 },
      finePaid: false,
    }).session(session);

    if (issues.length !== issueIds.length) {
      throw new Error("Some issues already paid or invalid");
    }

    const totalFine = issues.reduce((sum, i) => sum + i.fine, 0);

    const payment = await FinePayment.create(
      [{
        student: issues[0].student,
        issues: issueIds,
        amount: totalFine,
        paymentMode,
        paymentGateway: paymentMode === "online" ? "razorpay" : null,
        transactionId: paymentMode === "online" ? transactionId : null,
        status: "success",
        collectedBy: req.user._id,
      }],
      { session }
    );

    await bookIssueModel.updateMany(
      { _id: { $in: issueIds } },
      { $set: { finePaid: true } },
      { session }
    );

    await session.commitTransaction();

    res.json({
      success: true,
      receiptId: payment[0]._id,
      totalFine,
    });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
});


