import asyncHandler from 'express-async-handler'
import courseModel from '../../models/course/courseModel.js';
import userModel from '../../models/user/userModel.js';
import { populateCourseFull } from '../../helper/coursePopulatehelper.js';


// REMOVE COURSE FROM TRAINER (Superadmin Only)

export const removeTrainerFromCourse = asyncHandler(async (req, res) => {
  const { trainerId, courseId } = req.body;

  if (!trainerId || !courseId) {
    return res.status(400).json({
      success: false,
      message: "trainerId and courseId are required",
    });
  }

  // Find course (by objectId or by courseId string)
  const course = /^[0-9a-fA-F]{24}$/.test(courseId)
    ? await courseModel.findById(courseId)
    : await courseModel.findOne({ courseId });

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    });
  }

  // Find trainer
  const trainer = await userModel.findOne({ trainerId, role: "trainer" });
  if (!trainer) {
    return res.status(404).json({
      success: false,
      message: "Trainer not found",
    });
  }

  // Check trainer exists in course
  if (!course.trainers.some((t) => t.toString() === trainer._id.toString())) {
    return res.status(400).json({
      success: false,
      message: "Trainer does not belong to this course",
    });
  }

  // Remove trainer from course.trainers array
  course.trainers = course.trainers.filter(
    (t) => t.toString() !== trainer._id.toString()
  );

  // Remove trainer mapping
  course.trainerStudentMap = course.trainerStudentMap.filter(
    (map) => map.trainer.toString() !== trainer._id.toString()
  );

  // Remove course from trainer.teachingCourses
  await userModel.updateOne(
    { _id: trainer._id },
    { $pull: { teachingCourses: course._id } }
  );

  await course.save();

  const populated = await populateCourseFull(course);

  return res.status(200).json({
    success: true,
    message: "Trainer removed from course successfully",
    course: populated,
  });
});