import asyncHandler from 'express-async-handler'
import courseModel from '../../models/course/courseModel.js';
export const getStudentCourses = asyncHandler(async (req, res) => {
  if (req.user.role !== "student")
    return res.status(403).json({ success: false, message: "Only students" });
  const studentId = req.user._id;
  const courses = await courseModel
    .find({ students: studentId })
    .populate("trainers", "name trainerId email profile_pic experience company phone")
    .populate({
      path: "trainerStudentMap",
      populate: [
        { path: "trainer", select: "name trainerId email profile_pic experience company phone" },
        { path: "students", select: "name email studentId" },
      ],
    });

  const finalCourses = courses.map((course) => {
    const assignedMap = course.trainerStudentMap.find((map) =>
      map.students?.some((s) => s._id.toString() === studentId.toString())
    );
    return {
      _id: course._id,
      courseId: course.courseId,
      name: course.name,
      price: course.price,
      course_img:course.course_img,
      trainer: assignedMap ? assignedMap.trainer : null,
    };
  });

  res.json({ success: true, user: req.user, courses: finalCourses });
});