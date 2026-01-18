import asyncHandler from 'express-async-handler'
import courseModel from '../../models/course/courseModel.js';
import { populateCourseFull } from '../../helper/coursePopulatehelper.js';
import userModel from '../../models/user/userModel.js';

export const createCourse = asyncHandler(async (req, res) => {
  if (req.user.role !== "superadmin") {
    return res
      .status(403)
      .json({ success: false, message: "Only Super Admin can create courses" });
  }

  const { courseId, name, price, trainerIds, course_img } = req.body;
  if (!courseId || !name || !price || !trainerIds || trainerIds.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required field !" });
  }

  const exists = await courseModel.findOne({ courseId });
  if (exists)
    return res
      .status(400)
      .json({ success: false, message: "Course already exists" });

  const trainers = await userModel.find({
    trainerId: { $in: trainerIds },
    role: "trainer",
  });
  if (trainers.length !== trainerIds.length)
    return res
      .status(400)
      .json({ success: false, message: "One or more trainers not found" });

  const trainerObjectIds = trainers.map((t) => t._id);
  const trainerStudentMap = trainerObjectIds.map((tid) => ({
    trainer: tid,
    students: [],
  }));

  const course = new courseModel({
    courseId,
    name,
    price,
    trainers: trainerObjectIds,
    students: [],
    trainerStudentMap,
    course_img
  });

  await course.save();

  if (trainerObjectIds.length > 0) {
    await userModel.updateMany(
      { _id: { $in: trainerObjectIds } },
      { $addToSet: { teachingCourses: course._id } }
    );
  }

  const populated = await populateCourseFull(course);
  res.status(201).json({
    success: true,
    message: "Course created successfully",
    course: populated,
  });
});