import asyncHandler from 'express-async-handler'
import courseModel from '../../models/course/courseModel.js';
import userModel from '../../models/user/userModel.js';
import { populateCourseFull } from '../../helper/coursePopulatehelper.js';
export const enrollStudent = asyncHandler(async (req, res) => {
  if (req.user.role !== "superadmin")
    return res.status(403).json({
      success: false,
      message: "Only Super Admin can enroll students",
    });

  const { studentId, trainerId } = req.body;
  const { courseId } = req.params;
  if (!studentId || !trainerId)
    return res
      .status(400)
      .json({ success: false, message: "studentId and trainerId required" });

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

  const trainer = await userModel.findOne({ trainerId, role: "trainer" });
  if (!trainer)
    return res
      .status(404)
      .json({ success: false, message: "Trainer not found" });

  if (!course.trainers.some((t) => t.equals(trainer._id)))
    return res.status(400).json({
      success: false,
      message: "This trainer does not belong to this course",
    });

  let map = course.trainerStudentMap.find(
    (m) => m.trainer.toString() === trainer._id.toString()
  );
  if (map && map.students.some((s) => s.equals(student._id)))
    return res.status(400).json({
      success: false,
      message: "Student already enrolled under this trainer",
    });

  if (course.students.some((s) => s.equals(student._id)))
    return res.status(400).json({
      success: false,
      message: "Student already enrolled in this course",
    });

  if (map) map.students.push(student._id);
  else
    course.trainerStudentMap.push({
      trainer: trainer._id,
      students: [student._id],
    });

  course.students.push(student._id);
  await course.save();

  await userModel.updateOne(
    { _id: student._id },
    { $addToSet: { assignedCourses: course._id } }
  );

  const populated = await populateCourseFull(course);
  res.status(200).json({
    success: true,
    message: "Student enrolled successfully",
    course: populated,
  });
});