import asyncHandler from 'express-async-handler'
import userModel from "../../models/user/userModel.js";

export const getUserById = asyncHandler(async (req, res) => {
  const user = await userModel
    .findById(req?.params?.id)
    .select("-password -securityAnswerHash");
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone:user.phone
    },
  });
});