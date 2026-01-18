import asyncHandler from "express-async-handler";
import userModel from "../../models/user/userModel.js";


export const forgotPasswordQuestion = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if(!email){
    return res.status(400).json({
        success:false,
        message:"Email required !"
    })
  }
  try {
    const user = await userModel.findOne({ email }).select("email securityQuestion");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }
    res.json({
      email: user?.email,
      securityQuestion: user?.securityQuestion,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});