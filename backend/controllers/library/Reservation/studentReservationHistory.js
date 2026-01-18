import asyncHandler from "express-async-handler";
import bookReservationModel from "../../../models/library/bookReservationModel.js";

export const studentReservationHistory = asyncHandler(async(req,res)=>{
    const reservations = await bookReservationModel.find(
        {student:req.user._id}
    )
    .populate("book","title author isbn")
    .sort({createdAt:-1});
    res.json({
        success:true,
        count:reservations.length,
        reservations
    })
})