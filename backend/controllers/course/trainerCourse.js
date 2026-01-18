import asyncHandler from 'express-async-handler'
import courseModel from '../../models/course/courseModel.js';
export const getTrainerCourses = asyncHandler(async (req, res) => {
  if (req.user.role !== "trainer")
    return res
      .status(403)
      .json({ success: false, message: "Only trainers can access this !" });
  const trainerId = req.user._id;
  const courses = await courseModel
    .find({ trainers: trainerId })
    .populate("students", "name email studentId")
    .lean();
  const mapped = courses.map((c) => ({
    _id: c._id,
    courseId: c.courseId,
    name: c.name,
    studentCount: c.students ? c.students.length : 0,
    students: c.students || [],
  }));
  res.json({
     success: true, 
     courses: mapped 
    });
});