import mongoose from 'mongoose'

const finePaymentSchema = new mongoose.Schema({
    students:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    issues:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'BookIssue',
            required:true
        }
    ],
    amount:{
        type:Number,
        required:true,
        min:1
    },
    paymentMode:{
        type:String,
        enum:["cash","online"],
        required:true
    },
    paymentGateway:{
        type:String
    },
    transactionId:{
        type:String
    },
    status:{
        type:String,
        enum:["pending","success","failed"],
        default:"pending"
    },
    collectedBy :{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

const FinePayment = new mongoose.model("FinePayment",finePaymentSchema)
export default FinePayment