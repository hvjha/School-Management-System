import asyncHandler from "express-async-handler";
import userModel from "../../models/user/userModel.js";
import bcrypt from "bcryptjs";
import { ensureUniqueStudentId, ensureUniqueTrainerId, generateStudentIdBase, trainerBaseFromName } from "../../utils/uniqueId.js";



const formatPhone = (phone) => {
  let cleaned = phone.toString().replace(/\D/g, "");
  if (cleaned.length === 10) return cleaned;
  return null;
};

// superadmin create user(trainer/student)
export const createUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    securityQuestion,
    securityAnswer,
    profile_pic,
    phone,
    experience,
    company
  } = req.body;
  if (
    !name ||
    !email ||
    !password ||
    !role ||
    !securityQuestion ||
    !securityAnswer ||
    !phone
  ) {
    return res.status(400).json({
      success: false,
      message: "Missing Require fields !",
    });
  }

  if (!["trainer", "student", "superadmin"].includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role" });
  }

 const formattedPhone = formatPhone(phone);
if (!formattedPhone) {
  return res.status(400).json({
    success: false,
    message: "Invalid phone number! Must be 10 digits (Indian).",
  });
}


  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already Registered !",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const securityAnswerHash = await bcrypt?.hash(securityAnswer, salt);
    const user = new userModel({
      name,
      email,
      password: hashPassword,
      role: role || "student",
      securityQuestion,
      securityAnswerHash,
      profile_pic: profile_pic || " ",
      phone:formattedPhone,
      experience,
      company
    });
    if (role === "trainer" && !user.trainerId) {
      const base = trainerBaseFromName(user.name);
      user.trainerId = await ensureUniqueTrainerId(base);
    }
    if (role === "student") {
      const base = generateStudentIdBase(name);
      const studentId = await ensureUniqueStudentId(base);
      user.studentId = studentId;
    }
    await user.save();
    return res.status(201).json({
      success: true,
      message: "User created successfully.",
      user: {
        id: user?.id,
        name: user?.name,
        email:user.email,
        role: user?.role,
        trainerId: user.trainerId,
        studentId: user?.studentId,
        phone:user?.phone,
        profile:user?.profile,
         experience: user.experience,
        company: user.company,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});
