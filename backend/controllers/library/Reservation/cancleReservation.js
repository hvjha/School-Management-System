import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import bookReservationModel from "../../../models/library/bookReservationModel.js";
export const cancleReservation = asyncHandler(async (req, res) => {
  const { reservationId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(reservationId)) {
    throw new Error("Invalid reservation ID");
  }
  const query = {
    _id: reservationId,
    status: "pending"
  };

  // If not superadmin, ensure user is the one who made the reservation
  if (req.user.role !== 'superadmin') {
    query.student = req.user._id;
  }

  const reservation = await bookReservationModel.findOne(query);

  if (!reservation) {
    throw new Error("Reservation not found, already processed, or unauthorized");
  }
  reservation.status="cancelled"
  await reservation.save()
  res.json({
    success:true,
    message:"Reservation cancelled successfully"
  })
});
