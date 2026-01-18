import asyncHandler from 'express-async-handler'
import userModel from '../../models/user/userModel.js';
import { ensureUniqueTrainerId, trainerBaseFromName } from '../../utils/uniqueId.js';
const formatPhone = (phone) => {
  let cleaned = phone.toString().replace(/\D/g, "");
  if (cleaned.length === 10) return cleaned;
  return null;
};

export const updateUser = asyncHandler(async (req, res) => {
  const {
    name,
    role,
    password,
    securityQuestion,
    securityAnswer,
    profile_pic,
    phone,
    experience,
    company
  } = req.body;

  try {
    const user = await userModel.findById(req?.params?.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    if (name) user.name = name;
    if (role) user.role = role;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    if (securityQuestion) user.securityQuestion = securityQuestion;
    if (securityAnswer) {
      const salt = await bcrypt.genSalt(10);
      user.securityAnswerHash = await bcrypt.hash(securityAnswer, salt);
    }

    // Ensure phone is only digits and add +91
   if (phone) {
  const formattedPhone = formatPhone(phone);
  if (!formattedPhone) {
    return res.status(400).json({
      success: false,
      message: "Invalid phone number! Must be 10 digits (Indian).",
    });
  }
  user.phone = formattedPhone;
}
    // Only update profile pic if string URL
    if (profile_pic && typeof profile_pic === "string" && profile_pic !== "") {
      user.profile_pic = profile_pic;
    }

    // Assign trainerId if role = trainer and doesn't exist
    if (role === "trainer" && !user.trainerId) {
      const base = trainerBaseFromName(user.name);
      user.trainerId = await ensureUniqueTrainerId(base);
    }

    if(experience){
      user.experience=experience;
    }
    if(company){
      user.company = company
    }

    await user.save();

    res.json({
      success: true,
      message: "User Updated successfully",
      user: {
        id: user?._id,
        name: user?.name,
        role: user?.role,
        trainerId: user?.trainerId,
        studentId: user?.studentId,
        phone: user?.phone || "",
        profile_pic: user?.profile_pic || "",
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