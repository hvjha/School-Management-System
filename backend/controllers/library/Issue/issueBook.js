import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import courseModel from "../../../models/course/courseModel.js";
import bookIssueModel from "../../../models/library/bookIssueModel.js";
import bookModel from "../../../models/library/bookModel.js";
import userModel from "../../../models/user/userModel.js";
import bookReservationModel from "../../../models/library/bookReservationModel.js";

export const issueBooks = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { student, books, dueDate, remarks } = req.body;

    /* ---------- BASIC VALIDATION ---------- */
    if (!student || !Array.isArray(books) || books.length === 0 || !dueDate) {
      throw new Error("student, books[] and dueDate are required");
    }

    if (!mongoose.Types.ObjectId.isValid(student)) {
      throw new Error("Invalid student ID");
    }

    if (books.length > 5) {
      throw new Error("Maximum 5 books can be issued at a time");
    }

    for (const bookId of books) {
      if (!mongoose.Types.ObjectId.isValid(bookId)) {
        throw new Error("Invalid book ID found");
      }
    }

    if (new Date(dueDate) <= new Date()) {
      throw new Error("Due date must be a future date");
    }

    /* ---------- USER & ELIGIBILITY ---------- */
    const user = await userModel.findById(student).session(session);
    if (!user) throw new Error("User not found");

    const unpaidFine = await bookIssueModel.exists(
      { student, fine: { $gt: 0 }, finePaid: false },
      { session }
    );
    if (unpaidFine) {
      throw new Error("Clear pending fine before issuing books");
    }

    if (user.role === "student") {
      const enrolled = await courseModel.exists(
        { students: user._id },
        { session }
      );
      if (!enrolled) {
        throw new Error("Student not enrolled in any course");
      }
    }

    /* ---------- LIMIT LOGIC ---------- */
    const overdueCount = await bookIssueModel.countDocuments(
      { student, returnedLate: true },
      { session }
    );
    const maxAllowed = overdueCount >= 3 ? 2 : 5;

    const activeCount = await bookIssueModel.countDocuments(
      { student, status: "issued" },
      { session }
    );

    if (activeCount + books.length > maxAllowed) {
      throw new Error(
        `You can issue only ${maxAllowed - activeCount} more books`
      );
    }

    /* ---------- DUPLICATES & AVAILABILITY ---------- */
    const uniqueBooks = [...new Set(books)];
    if (uniqueBooks.length !== books.length) {
      throw new Error("Duplicate book IDs found");
    }

    const alreadyIssued = await bookIssueModel.exists(
      { student, book: { $in: books }, status: "issued" },
      { session }
    );
    if (alreadyIssued) {
      throw new Error("One or more books already issued to the student");
    }

    const bookDocs = await bookModel
      .find({ _id: { $in: books } })
      .session(session);

    if (bookDocs.length !== books.length) {
      throw new Error("One or more books not found");
    }

    for (const book of bookDocs) {
      if (book.availableCopies < 1) {
        throw new Error(`Book not available: ${book.title}`);
      }
    }

    /* ---------- ISSUE BOOKS ---------- */
    const issueBatchId = new mongoose.Types.ObjectId();

    const issueDocs = bookDocs.map((book) => ({
      book: book._id,
      student,
      issueBatchId,
      dueDate,
      issuedBy: req.user._id,
      remarks,
      status: "issued",
    }));

    const insertedIssues = await bookIssueModel.insertMany(issueDocs, {
      session,
    });

    const bulkOps = bookDocs.map((book) => ({
      updateOne: {
        filter: { _id: book._id },
        update: { $inc: { availableCopies: -1 } },
      },
    }));

    await bookModel.bulkWrite(bulkOps, { session });
  await bookReservationModel.findOneAndUpdate(
      {
        books,
        student,
        status: "pending",
      },
      {
        status: "fulfilled",
      }
    );
    await session.commitTransaction();

    const populatedIssues = await bookIssueModel
      .find({ _id: { $in: insertedIssues.map((i) => i._id) } })
      .populate("book", "title author isbn")
      .populate("student", "name email")
      .populate("issuedBy", "name email");

  

    return res.status(201).json({
      success: true,
      message: "Books issued successfully",
      issuedCount: populatedIssues.length,
      issues: populatedIssues,
    });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
});
