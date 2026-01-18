import mongoose from 'mongoose'

const bookReservationSchema = new mongoose.Schema({
    book:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Book',
        required:true
    },
    student:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    reservationDate:{
        type:Date,
        required:true,
        default:Date.now,
    },
    status:{
        type:String,
        enum:['pending','fulfilled','cancelled','expired'],
        default:'pending'
    },
    expiryDate:{
        type:Date,
        required:true,
    }
},{timestamps:true})

bookReservationSchema.index(
    {book:1,student:1,status:1},
    {
        unique:true,
        partialFilterExpression:{status:'pending'}
    }
);

const bookReservationModel = new mongoose.model('BookReservation',bookReservationSchema)
export default bookReservationModel