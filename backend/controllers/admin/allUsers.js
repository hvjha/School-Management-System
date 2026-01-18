import asyncHandler from "express-async-handler";
import userModel from "../../models/user/userModel.js";

export const getAllusers = asyncHandler(async (req, res) => {
  const users = await userModel.find().select("-password -securityAnswerHash");
  const totalUsers = await userModel.countDocuments();
  const trainerCount = await userModel.countDocuments({ role: "trainer" });
  const studentCount = await userModel.countDocuments({ role: "student" });
  res.json({
    totalUsers,
    trainerCount,
    studentCount,
    users,
  });
});
