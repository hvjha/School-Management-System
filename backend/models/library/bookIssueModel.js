import mongoose from 'mongoose'

const bookIssueSchema = new mongoose.Schema({
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
      issueBatchId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    issueDate:{
        type:Date,
        required:true,
        default:Date.now,
    },
    dueDate:{
        type:Date,
        required:true
    },
    returnDate:{
        type:Date,
        default:null
    },
    status:{
        type:String,
        enum:['issued','returned','overdue'],
        default:'issued'
    },
    fine:{
        type:Number,
        default:0,
        min:0
    },
    finePaid: {
      type: Boolean,
      default: true,
      index: true
    },
     returnedLate: {
      type: Boolean,
      default: false,
      index: true
    },
    issuedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    returnedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    remarks:{
        type:String
    }
},{timestamps:true})

bookIssueSchema.index({student:1,status:1})
bookIssueSchema.index({book:1,status:1},{ partialFilterExpression: { status: "issued" }})
bookIssueSchema.index({dueDate:1,status:1})
bookIssueSchema.index({ student: 1, finePaid: 1 });
bookIssueSchema.index({ student: 1, returnedLate: 1 });

const bookIssueModel = new mongoose.model('BookIssue',bookIssueSchema)
export default bookIssueModel