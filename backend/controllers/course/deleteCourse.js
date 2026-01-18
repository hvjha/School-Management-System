import asyncHandler from 'express-async-handler'
import courseModel from '../../models/course/courseModel.js';
import userModel from '../../models/user/userModel.js';
export const deleteCourse = asyncHandler(async (req, res) => {
  if (req.user.role !== "superadmin")
    return res
      .status(403)
      .json({ success: false, message: "Only Super Admin can delete courses" });
  const { id } = req.params;
  const course = await courseModel.findById(id);
  if (!course)
    return res
      .status(404)
      .json({ success: false, message: "Course not found" });

  await userModel.updateMany(
    { _id: { $in: course.trainers } },
    { $pull: { teachingCourses: course._id } }
  );
  await userModel.updateMany(
    { assignedCourses: course._id },
    { $pull: { assignedCourses: course._id } }
  );
  await course.deleteOne();
  res.json({ success: true, message: "Course deleted successfully" });
});