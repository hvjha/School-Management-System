import asyncHandler from 'express-async-handler'
import userModel from "../../models/user/userModel.js";
import bcrypt from "bcryptjs";
import { verifyToken } from "../../utils/token.js";

export const forgotPasswordReset = asyncHandler(async (req, res) => {
  const { resetToken, newPassword } = req.body;
  if(!resetToken || !newPassword){
    return res.status(400).json({
        success:false,
        message:"Missing fields"
    })
  }

  try {
    const data = verifyToken(resetToken, "reset");
    const user = await userModel.findById(data?.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);
    user.password = hashed;
    await user.save();
    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
});