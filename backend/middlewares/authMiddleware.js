import jwt from "jsonwebtoken";
import userModel from "../models/user/userModel.js";
import asyncHandler from "express-async-handler";

const authToken = asyncHandler(async (req, res, next) => {
  try {
    const { token } = req?.cookies;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, login again",
      });
    }
    const tokenDecode = jwt.verify(token, process.env.JWT_SECERET);
    req.user = await userModel
      .findById(tokenDecode?.id)
      .select("-password -securityAnswerHash");
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User not found",
      });
    }
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

export default authToken;
