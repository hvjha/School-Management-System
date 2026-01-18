import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    courseId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    trainers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    trainerStudentMap: [
      {
        trainer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        students: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
      },
    ],
    course_img:{
      type:String,
      default:""
    }
  },
  { timestamps: true }
);

const courseModel = new mongoose.model("Course", courseSchema);
export default courseModel;
