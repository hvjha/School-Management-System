import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import bookIssueModel from "../../../models/library/bookIssueModel.js";

export const libraryReport = asyncHandler(async (req, res) => {
  const { from, to, status, studentId } = req.query;

  const match = {};

  // Date filter (safe)
  if (from || to) {
    match.issueDate = {};
    if (from) match.issueDate.$gte = new Date(from);
    if (to) match.issueDate.$lte = new Date(to);
  }

  // Status filter (issued / returned / overdue)
  if (status) {
    match.status = status;
  }

  // Student filter
  if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
    match.student = new mongoose.Types.ObjectId(studentId);
  }

  const report = await bookIssueModel.aggregate([
    { $match: match },

    // Student
    {
      $lookup: {
        from: "users",
        localField: "student",
        foreignField: "_id",
        as: "student"
      }
    },
    { $unwind: "$student" },

    // Book
    {
      $lookup: {
        from: "books",
        localField: "book",
        foreignField: "_id",
        as: "book"
      }
    },
    { $unwind: "$book" },

    // Final shape
    {
      $project: {
        issueDate: 1,
        dueDate: 1,
        returnDate: 1,
        status: 1,
        fine: 1,
        finePaid: 1,
        returnedLate: 1,

        student: {
          _id: "$student._id",
          name: "$student.name",
          email: "$student.email",
          phone: "$student.phone"
        },

        book: {
          _id: "$book._id",
          title: "$book.title",
          isbn: "$book.isbn"
        }
      }
    },

    { $sort: { issueDate: -1 } }
  ]);

  // Summary (admin-friendly)
  const summary = {
    totalIssues: report.length,
    totalReturned: report.filter(r => r.status === "returned").length,
    totalIssued: report.filter(r => r.status === "issued").length,
    totalFineCollected: report.reduce((sum, r) => sum + (r.fine || 0), 0)
  };

  res.status(200).json({
    success: true,
    summary,
    count: report.length,
    report
  });
});
