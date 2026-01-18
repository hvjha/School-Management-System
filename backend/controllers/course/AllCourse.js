import asyncHandler from 'express-async-handler'
import courseModel from '../../models/course/courseModel.js';

export const getAllCourse = asyncHandler(async (req, res) => {
  const courses = await courseModel
    .find()
    .populate("trainers", "name trainerId email experience company")
    .populate("students", "name email studentId")
    .populate({
      path: "trainerStudentMap",
      populate: [
        { path: "trainer", select: "name trainerId email" },
        { path: "students", select: "name email studentId" },
      ],
    });

  const mapped = courses.map((c) => ({
    ...c.toObject(),
    studentCount: c.students ? c.students.length : 0,
  }));
  res.json({ success: true, courses: mapped });
});
