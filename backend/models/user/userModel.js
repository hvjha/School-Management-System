import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role: { 
        type: String, 
        enum: ['superadmin','trainer','student'], 
        default: 'student' 
    },
    studentId: { 
        type: String, 
        unique: true ,
        sparse: true
    },
    trainerId:{
        type:String,
        unique:true,
        sparse:true
    },
    securityQuestion:{
        type:String,
        required:true
    },
    securityAnswerHash:{
        type:String,
        required:true
    },
    assignedCourses: [{ 
        type: mongoose.Schema.Types.ObjectId,
         ref: 'Course' 
    }],
    teachingCourses:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Course'
    }],
     profile_pic:{
        type:String,
        default:""
    },
    phone:{
        type:String,
        required:true,
        unique:true
    },
     experience: { 
        type: String, 
        default: "" 
    },
    company: { 
        type: String, 
        default: "" 
    },
},{timestamps:true})

const userModel = mongoose.model('User',userSchema)
export default userModel;