import asyncHandler from 'express-async-handler'
import courseModel from '../../models/course/courseModel.js';
import userModel from '../../models/user/userModel.js';
import { populateCourseFull } from '../../helper/coursePopulatehelper.js';
export const assignTrainerToCourse = asyncHandler(async (req, res) => {
  if (req.user.role !== "superadmin")
    return res.status(403).json({
      success: false,
      message: "Only Super Admin can assign trainers",
    });

  const { courseId, trainerId } = req.body;
  if (!courseId || !trainerId)
    return res
      .status(400)
      .json({ success: false, message: "courseId and trainerId are required" });

  const course = /^[0-9a-fA-F]{24}$/.test(courseId)
    ? await courseModel.findById(courseId)
    : await courseModel.findOne({ courseId });
  if (!course)
    return res
      .status(404)
      .json({ success: false, message: "Course not found" });

  const trainer = await userModel.findOne({ trainerId, role: "trainer" });
  if (!trainer)
    return res
      .status(404)
      .json({ success: false, message: "Trainer not found" });

  if (!course.trainers.some((t) => t.equals(trainer._id))) {
    course.trainers.push(trainer._id);
    const existsMap = course.trainerStudentMap.some(
      (m) => m.trainer.toString() === trainer._id.toString()
    );
    if (!existsMap)
      course.trainerStudentMap.push({ trainer: trainer._id, students: [] });
    await course.save();
  }

  if (!trainer.teachingCourses.includes(course._id)) {
    trainer.teachingCourses.push(course._id);
    await trainer.save();
  }

  const populated = await populateCourseFull(course);
  res.json({
    success: true,
    message: `Trainer ${trainer.name} assigned to course ${course.name} successfully`,
    course: populated,
    trainer,
  });
});