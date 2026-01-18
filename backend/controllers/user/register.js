import asyncHandler from "express-async-handler";
import userModel from "../../models/user/userModel.js";
import { createAuthToken } from "../../utils/token.js";

import bcrypt from "bcryptjs";
import { ensureUniqueStudentId, generateStudentIdBase } from "../../utils/uniqueId.js";


const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  maxAge: 24 * 60 * 60 * 1000,
};

const formatPhone = (phone) => {
  if (!phone) return null;
  let cleaned = phone.toString().replace(/\D/g, "");
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    cleaned = cleaned.slice(2);
  }
  if (cleaned.length === 10) return cleaned;

  return null;
};

export const Register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    securityQuestion,
    securityAnswer,
    profile_pic,
    phone,
  } = req?.body;

  if (
    !name ||
    !email ||
    !password ||
    !role ||
    !securityQuestion ||
    !securityAnswer ||
    !phone
  ) {
    return res?.status(400)?.json({
      success: false,
      message: "Missing Required Field !",
    });
  }
  const formattedPhone = formatPhone(phone);
  if (!formattedPhone) {
    return res.status(400).json({
      success: false,
      message: "Invalid phone number! Must be 10 digits (Indian).",
    });
  }

  if (role === "trainer" || role === "superadmin") {
    return res.status(403).json({
      success: false,
      message: "Only superadmin can create trainers or superadmins!",
    });
  }
  try {
    const existingUser = await userModel?.findOne({ email });
    if (existingUser) {
      return res?.status(400)?.json({
        success: false,
        message: "Email already Registered !",
      });
    }

    const salt = await bcrypt?.genSalt(10);
    const hashPassword = await bcrypt?.hash(password, salt);
    const securityAnswerHash = await bcrypt?.hash(securityAnswer, salt);
    const finalRole = "student";

    const base = generateStudentIdBase(name);
    const studentId = await ensureUniqueStudentId(base);

    const user = new userModel({
      name,
      email,
      password: hashPassword,
      role: finalRole,
      phone: formattedPhone,
      profile_pic: profile_pic || "",
      studentId,
      securityQuestion,
      securityAnswerHash,
    });
    const token = createAuthToken(user?._id);

    res.cookie("token", token, cookieOptions);

    await user?.save();
    res?.status(201)?.json({
      success: true,
      message: "User Registered successfully",
      user: {
        id: user?._id,
        name: user?.name,
        email: user?.email,
        role: finalRole,
        studentId: user?.studentId,
        profile_pic: user?.profile_pic,
        phone: user?.phone,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});