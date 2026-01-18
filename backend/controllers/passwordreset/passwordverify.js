import asyncHandler from 'express-async-handler'
import userModel from "../../models/user/userModel.js";
import bcrypt from "bcryptjs";
import { createResetToken } from "../../utils/token.js";

export const forgotPasswordVerify = asyncHandler(async (req, res) => {
  const { email, securityAnswer } = req.body;
  if (!email || !securityAnswer) {
    return res.status(400).json({
      success: false,
      message: "Missing required field !",
    });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const match = await bcrypt.compare(securityAnswer,user?.securityAnswerHash);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Incorrect answer",
      });
    }
    const resetToken = createResetToken(user?._id);
    res.json({
      success: true,
      message: "Answer verified",
      resetToken,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});