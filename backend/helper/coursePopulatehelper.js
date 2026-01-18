import courseModel from "../models/course/courseModel.js";

export const populateCourseFull = async (course) => {
  return await courseModel
    .findById(course._id)
    .populate("trainers", "name trainerId email profile_pic experience company")
    .populate("students", "name email studentId")
    .populate({
      path: "trainerStudentMap",
      populate: [
        { path: "trainer", select: "name trainerId email profile_pic experience company" },
        { path: "students", select: "name email studentId" },
      ],
    });
};