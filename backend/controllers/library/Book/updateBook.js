import mongoose from "mongoose";
import bookModel from "../../../models/library/bookModel.js";
import asyncHandler from "express-async-handler";

export const updateBook = asyncHandler(async (req, res) => {
  const { bookId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Book ID"
    });
  }

  const book = await bookModel.findById(bookId);
  if (!book) {
    return res.status(404).json({
      success: false,
      message: "Book Not Found"
    });
  }

  // Calculate issued copies
  const issuedCopies = book.totalCopies - book.availableCopies;

  // If totalCopies is being updated
  if (req.body.totalCopies !== undefined) {
    if (req.body.totalCopies < issuedCopies) {
      return res.status(400).json({
        success: false,
        message: `Total copies cannot be less than issued copies (${issuedCopies})`
      });
    }

    // Recalculate available copies automatically
    book.availableCopies = req.body.totalCopies - issuedCopies;
    book.totalCopies = req.body.totalCopies;
  }

  // Update other allowed fields (excluding availableCopies)
  const allowedFields = [
    "title",
    "author",
    "category",
    "publisher",
    "publishedYear",
    "description",
    "coverImage",
    "shelfLocation"
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      book[field] = req.body[field];
    }
  });

  await book.save();

  return res.status(200).json({
    success: true,
    message: "Book updated successfully",
    book
  });
});
