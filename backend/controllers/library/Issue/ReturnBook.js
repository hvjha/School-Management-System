import mongoose from "mongoose";
import bookIssueModel from "../../../models/library/bookIssueModel.js";
import bookModel from "../../../models/library/bookModel.js";
import asyncHandler from "express-async-handler";

export const returnBook = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { issueId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(issueId)) {
      throw new Error("Invalid issueId");
    }

    const issue = await bookIssueModel
      .findOne({ _id: issueId, status: "issued" })
      .session(session);

    if (!issue) {
      throw new Error("Book already returned or invalid issueId");
    }

    const today = new Date();
    let fine = 0;
    let returnedLate = false;

    if (today > issue.dueDate) {
      const daysLate = Math.ceil(
        (today - issue.dueDate) / (1000 * 60 * 60 * 24)
      );
      fine = daysLate * 5;
      returnedLate = true;
    }

    issue.set({
      status: "returned",
      returnDate: today,
      fine,
      finePaid: fine === 0,
      returnedLate,
      returnedBy: req.user._id
    });

    await issue.save({ session });

    await bookModel.findByIdAndUpdate(
      issue.book,
      { $inc: { availableCopies: 1 } },
      { session }
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Book returned successfully",
      issueId: issue._id,
      fine,
      returnedLate
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      success: false,
      message: error.message
    });
  } finally {
    session.endSession();
  }
});
