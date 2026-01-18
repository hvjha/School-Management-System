import asyncHandler from 'express-async-handler'
import userModel from "../../models/user/userModel.js";

export const getAllTrainers = asyncHandler(async (req, res) => {
  const trainers = await userModel.find(
    { role: "trainer" },
    { name: 1, trainerId: 1, email: 1 }
  );
  res.json({ success: true, trainers });
});