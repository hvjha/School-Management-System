import expressAsyncHandler from "express-async-handler";
import bookReservationModel from "../../../models/library/bookReservationModel.js";

export const allReservations = expressAsyncHandler(async(req,res)=>{
    const reservations = await bookReservationModel.find()
    .populate("book","title name isbn")
    .populate("student","name email phone")
    .sort({createdAt:-1})
    res.json({
        success:true,
        count:reservations.length,
        reservations
    })
})