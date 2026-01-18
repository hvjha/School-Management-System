import asyncHandler from 'express-async-handler'
import userModel from '../../models/user/userModel.js';
export const deleteUser = asyncHandler(async (req, res) => {
  try {
    // Delete the user
    const user = await userModel.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Remove user from any courses (as student)
    const Course = (await import("../../models/course/courseModel.js")).default;
    await Course.updateMany({}, { $pull: { students: user._id } });

    // Remove user from any courses as trainer
    await Course.updateMany({}, { $pull: { trainers: user._id } });

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});