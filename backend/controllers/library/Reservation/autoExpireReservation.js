import bookReservationModel from "../../../models/library/bookReservationModel.js"
import asyncHandler from 'express-async-handler'

export const expireReservations = asyncHandler(async (req, res) => {
  const result = await bookReservationModel.updateMany(
    {
      status: "pending",
      expiryDate: { $lt: new Date() }
    },
    { $set: { status: "expired" } }
  );

  res.json({
    success: true,
    expiredCount: result.modifiedCount
  });
});
