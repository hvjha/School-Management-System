import asyncHandler from "express-async-handler";
import userModel from "../../models/user/userModel.js";

export const getPublicStats = asyncHandler(async (req, res) => {
  const trainerCount = await userModel.countDocuments({ role: "trainer" });
  const studentCount = await userModel.countDocuments({ role: "student" });
  
  // Also fetch basic trainer info for the showcase
  const trainers = await userModel.find({ role: "trainer" })
    .select("name email profile_pic experience company trainerId");

  res.json({
    trainerCount,
    studentCount,
    trainers
  });
});
