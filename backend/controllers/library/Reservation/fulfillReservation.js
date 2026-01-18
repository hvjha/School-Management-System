import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import bookIssueModel from "../../../models/library/bookIssueModel.js";
import bookModel from "../../../models/library/bookModel.js";
import bookReservationModel from "../../../models/library/bookReservationModel.js";

export const fulfillReservation = asyncHandler(async (req, res) => {
  const { reservationId } = req.params;
  const { dueDate, remarks } = req.body;

  if (!dueDate) {
    throw new Error("Due date is required to issue the book");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const reservation = await bookReservationModel.findById(reservationId)
      .populate("book")
      .session(session);

    if (!reservation) {
      throw new Error("Reservation not found");
    }

    if (reservation.status !== "pending") {
      throw new Error(`Reservation is already ${reservation.status}`);
    }

    const book = reservation.book;
    if (book.availableCopies < 1) {
      throw new Error("Insufficient stock to fulfill this reservation right now");
    }

    // 1. Create the issue record
    const issueBatchId = new mongoose.Types.ObjectId();
    const issue = await bookIssueModel.create([{
      book: book._id,
      student: reservation.student, // 'student' field in model refers to user (trainer/student)
      issueBatchId,
      dueDate,
      issuedBy: req.user._id,
      remarks: remarks || "Fulfilled from reservation",
      status: "issued"
    }], { session });

    // 2. Update book availability
    await bookModel.findByIdAndUpdate(book._id, {
      $inc: { availableCopies: -1 }
    }, { session });

    // 3. Update reservation status
    reservation.status = "fulfilled";
    await reservation.save({ session });

    await session.commitTransaction();
    res.json({
      success: true,
      message: "Reservation fulfilled and book issued successfully",
      issue: issue[0]
    });

  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
});
