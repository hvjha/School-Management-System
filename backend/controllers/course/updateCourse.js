import asyncHandler from 'express-async-handler'
import courseModel from '../../models/course/courseModel.js';
import userModel from '../../models/user/userModel.js';
import { populateCourseFull } from '../../helper/coursePopulatehelper.js';
import mongoose from 'mongoose';
export const updateCourse = asyncHandler(async (req, res) => {
  if (req.user.role !== "superadmin")
    return res
      .status(403)
      .json({ success: false, message: "Only Super Admin can update courses" });

  const { id } = req.params;
  const { courseId, name, price, trainerIds, course_img } = req.body;

  const course = await courseModel.findById(id);
  if (!course)
    return res
      .status(404)
      .json({ success: false, message: "Course Not Found" });

  // update simple fields
  if (courseId && courseId !== course.courseId) {
    const exists = await courseModel.findOne({ courseId });
    if (exists)
      return res
        .status(400)
        .json({ success: false, message: "CourseId already used" });
    course.courseId = courseId;
  }

  if (name) course.name = name;
  if (price) course.price = price;
  if (course_img && typeof course_img === "string" && course_img !== "") {
      course.course_img = course_img;
    }

  // update trainers
  if (trainerIds && trainerIds.length > 0) {
    // find trainer documents
    const trainers = await userModel.find({
      trainerId: { $in: trainerIds },
      role: "trainer",
    });

    if (trainers.length !== trainerIds.length)
      return res
        .status(400)
        .json({ success: false, message: "One or more trainers not found" });

    // convert to objectIds
    const newTrainerObjIds = trainers.map((t) => t._id.toString());
    const oldTrainerObjIds = course.trainers.map((t) => t.toString());

    const removed = oldTrainerObjIds.filter(
      (x) => !newTrainerObjIds.includes(x)
    );
    const added = newTrainerObjIds.filter((x) => !oldTrainerObjIds.includes(x));

    // remove trainers
    if (removed.length > 0) {
      await userModel.updateMany(
        { _id: { $in: removed } },
        { $pull: { teachingCourses: course._id } }
      );

      removed.forEach((tid) => {
        // remove trainer from map
        const map = course.trainerStudentMap.find(
          (m) => m.trainer.toString() === tid
        );
        if (map) {
          // remove related students from course student list
          const studentIds = map.students.map((s) => s.toString());

          course.students = course.students.filter(
            (s) => !studentIds.includes(s.toString())
          );
        }
      });

      // drop maps of removed trainers
      course.trainerStudentMap = course.trainerStudentMap.filter(
        (m) => !removed.includes(m.trainer.toString())
      );
    }

    // add trainers
    if (added.length > 0) {
      await userModel.updateMany(
        { _id: { $in: added } },
        { $addToSet: { teachingCourses: course._id } }
      );

      added.forEach((tid) => {
        const exists = course.trainerStudentMap.some(
          (m) => m.trainer.toString() === tid
        );
        if (!exists) {
          course.trainerStudentMap.push({
            trainer: new mongoose.Types.ObjectId(tid),
            students: [],
          });
        }
      });
    }

    // save final trainer list as ObjectId[]
    course.trainers = newTrainerObjIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );
  }

  await course.save();

  const populated = await populateCourseFull(course);

  res.json({
    success: true,
    message: "Course updated successfully",
    course: populated,
  });
});