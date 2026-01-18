import asyncHandler from "express-async-handler";
import bookIssueModel from "../../../models/library/bookIssueModel.js";
import mongoose from "mongoose";

export const studentLibraryHistory = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid studentId"
    });
  }

  const history = await bookIssueModel.aggregate([
    {
      $match: {
        student: new mongoose.Types.ObjectId(studentId)
      }
    },

    {
      $lookup: {
        from: "books",
        localField: "book",
        foreignField: "_id",
        as: "book"
      }
    },

    {
      $unwind: {
        path: "$book",
        preserveNullAndEmptyArrays: true
      }
    },

    {
      $group: {
        _id: "$issueBatchId",

        issueDate: { $min: "$createdAt" },
        dueDate: { $first: "$dueDate" },

        totalBooks: { $sum: 1 },

        returnedBooks: {
          $sum: {
            $cond: [{ $eq: ["$status", "returned"] }, 1, 0]
          }
        },

        totalFine: { $sum: "$fine" },

        books: {
          $push: {
            bookId: "$book._id",
            title: "$book.title",
            status: "$status",
            issueDate: "$createdAt",
            returnDate: "$returnDate",
            fine: "$fine"
          }
        }
      }
    },

    {
      $addFields: {
        batchCompleted: {
          $eq: ["$totalBooks", "$returnedBooks"]
        }
      }
    },

    {
      $sort: { issueDate: -1 }
    }
  ]);

  return res.status(200).json({
    success: true,
    count: history.length,
    history
  });
});
