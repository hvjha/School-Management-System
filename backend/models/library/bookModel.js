import mongoose from 'mongoose'

const bookSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    author:{
        type:String,
        required:true,
        trim:true
    },
    isbn:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    category:{
        type:String,
        enum:['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 
             'Mathematics', 'Programming', 'Business', 'Arts', 'Other'],
        default:'Other'
    },
    publisher:{
        type:String,
        trim:true,
    },
    publishedYear:{
        type:Number
    },
    totalCopies:{
        type:Number,
        default:1,
        min:1
    },
    availableCopies:{
        type:Number,
        default:1,
        min:0
    },
    description:{
        type:String,
    },
    coverImage:{
        type:String
    },
    shelfLocation:{
        type:String,
    },
    addedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
},{timestamps:true})

bookSchema.index({title:'text',author:'text',description:'text'});
bookSchema.index({isbn:1},{unique:true});
bookSchema.index({category:1});

const bookModel = new mongoose.model('Book',bookSchema)
export default bookModel;