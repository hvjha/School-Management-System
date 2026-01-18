import asyncHandler from 'express-async-handler'
import courseModel from '../../models/course/courseModel.js';
import userModel from '../../models/user/userModel.js';
import { populateCourseFull } from '../../helper/coursePopulatehelper.js';
export const removeStudentFromCourse = asyncHandler(async (req, res) => {
  if (req.user.role !== "superadmin")
    return res.status(403).json({
      success: false,
      message: "Only Super Admin can remove students from courses",
    });

  const { courseId } = req.params;
  const { studentId } = req.body;
  if (!studentId)
    return res
      .status(400)
      .json({ success: false, message: "studentId is required" });

  const course = /^[0-9a-fA-F]{24}$/.test(courseId)
    ? await courseModel.findById(courseId)
    : await courseModel.findOne({ courseId });
  if (!course)
    return res
      .status(404)
      .json({ success: false, message: "Course not found" });

  const student = await userModel.findOne({ studentId, role: "student" });
  if (!student)
    return res
      .status(404)
      .json({ success: false, message: "Student not found" });

  course.students = course.students.filter(
    (s) => s.toString() !== student._id.toString()
  );
  course.trainerStudentMap.forEach((map) => {
    map.students = map.students.filter(
      (s) => s.toString() !== student._id.toString()
    );
  });
  await course.save();

  student.assignedCourses = student.assignedCourses.filter(
    (c) => c.toString() !== course._id.toString()
  );
  await student.save();

  const populated = await populateCourseFull(course);
  res.status(200).json({
    success: true,
    message: `Student removed from course ${course.name} successfully`,
    course: populated,
  });
});