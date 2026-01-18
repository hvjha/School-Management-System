import asyncHandler from "express-async-handler";
import courseMaterial from "../../models/courseMaterial/courseMaterial.js";

export const uploadCourseMaterial = asyncHandler(async (req, res) => {
  const {
    courseId,
    title,
    description,
    file_url,
    file_type,
    thumbnail_url,
    duration,
  } = req.body;

  if (!courseId || !title || !file_url || !file_type) {
    return res.status(400).json({
      success: false,
      message: "courseId, title, file_url and file_type are required",
    });
  }

  const material = await courseMaterial.create({
    courseId,
    title,
    description,
    file_url,
    file_type,
    thumbnail_url: thumbnail_url || null,
    duration: file_type === "video" ? duration : 0,
    uploadedBy: req.user._id,
  });

  res.json({
    success: true,
    message: "Material uploaded successfully",
    material,
  });
});
