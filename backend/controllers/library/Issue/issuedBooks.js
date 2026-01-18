import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import bookIssueModel from "../../../models/library/bookIssueModel.js";

export const getIssuedBooksByStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid studentId",
    });
  }

  const issues = await bookIssueModel
    .find({
      student: studentId,      // ✅ NO ObjectId conversion
      status: "issued"
    })
    .populate("book", "title author isbn")
    .sort({ createdAt: -1 });

  if (issues.length === 0) {
    return res.status(200).json({  
      success: true,
      count: 0,
      issues: [],
    });
  }

  res.status(200).json({
    success: true,
    count: issues.length,
    issues,
  });
});
