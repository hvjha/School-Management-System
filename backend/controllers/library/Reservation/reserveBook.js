import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import bookModel from "../../../models/library/bookModel.js";
import bookReservationModel from "../../../models/library/bookReservationModel.js";
export const reserveBook = asyncHandler(async (req, res) => {
  const { bookId } = req.body;
  const trainerId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    throw new Error("Invalid book ID");
  }

  const book = await bookModel.findById(bookId);
  if (!book) {
    throw new Error("Book Not Found");
  }

  // No longer blocking reservation if copies are available, 
  // as trainers now use reservation as their primary request mechanism.

  // --- Reservation Constraints ---
  
  // 1. Get all pending reservations for this trainer
  const activeReservations = await bookReservationModel.find({
    student: trainerId,
    status: "pending"
  }).populate("book", "category");

  // 2. Max 3 active reservations
  if (activeReservations.length >= 3) {
    throw new Error("You can only have up to 3 active reservations at a time");
  }

  // 3. Unique category constraint
  const existingCategories = activeReservations.map(r => r.book.category);
  if (existingCategories.includes(book.category)) {
    throw new Error(`You already have a reservation in the '${book.category}' category. Please choose a book from a different category.`);
  }

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 3);

  const reservation = new bookReservationModel({
    book: bookId,
    student: trainerId,
    expiryDate,
  });

  await reservation.save();
  res.status(201).json({
    success: true,
    message: "Book reserved successfully",
    reservation,
  });
});
