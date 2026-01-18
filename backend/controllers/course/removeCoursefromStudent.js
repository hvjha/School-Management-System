import asyncHandler from 'express-async-handler'
import userModel from '../../models/user/userModel.js';
import courseModel from '../../models/course/courseModel.js';
import { populateCourseFull } from '../../helper/coursePopulatehelper.js';
export const removeCourseFromStudent = asyncHandler(async (req, res) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: "Only Super Admin can remove courses from students",
    });
  }

  const { studentId, courseId } = req.body;
  if (!studentId || !courseId)
    return res
      .status(400)
      .json({ success: false, message: "studentId and courseId required" });

  // Find student by _id or custom studentId
  const student = /^[0-9a-fA-F]{24}$/.test(studentId)
    ? await userModel.findById(studentId)
    : await userModel.findOne({ studentId });

  if (!student)
    return res.status(404).json({ success: false, message: "Student not found" });

  // Find course by _id or courseId
  const course = /^[0-9a-fA-F]{24}$/.test(courseId)
    ? await courseModel.findById(courseId)
    : await courseModel.findOne({ courseId });

  if (!course)
    return res.status(404).json({ success: false, message: "Course not found" });

  // Remove student from course
  course.students = course.students.filter(
    (s) => s.toString() !== student._id.toString()
  );

  // Remove student from trainerStudentMap
  course.trainerStudentMap.forEach((map) => {
    map.students = map.students.filter(
      (s) => s.toString() !== student._id.toString()
    );
  });

  await course.save();

  // Remove course from student's assignedCourses
  student.assignedCourses = student.assignedCourses.filter(
    (c) => c.toString() !== course._id.toString()
  );
  await student.save();

  const populated = await populateCourseFull(course);

  res.json({
    success: true,
    message: `Course ${course.name} removed from student ${student.name}`,
    student,
    course: populated,
  });
});