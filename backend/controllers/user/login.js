import asyncHandler from "express-async-handler";
import userModel from "../../models/user/userModel.js";
import { createAuthToken } from "../../utils/token.js";

import bcrypt from "bcryptjs";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  maxAge: 24 * 60 * 60 * 1000,
};

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Wrong Email or Password",
    });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User Not Found",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Wrong Password",
      });
    }
    const token = createAuthToken(user?._id);
    res.cookie("token", token, cookieOptions);
    res.json({
      success: true,
      message: "LoggedIn Successfully",
      user: {
        id: user?._id,
        name: user?.name,
        email: user?.email,
        role: user?.role,
        studentId: user?.studentId,
        trainerId: user?.trainerId,
        profile_pic:user?.profile_pic,
        phone:user?.phone,
        experience:user?.experience,
        company:user?.company
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});