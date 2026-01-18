import courseMaterial from "../../models/courseMaterial/courseMaterial.js";
// Get ALL content from ALL courses
export const getAllCourseContent = async (req, res) => {
  try {
    const content = await courseMaterial
      .find()
      .sort({ createdAt: -1 });

    res.json({ success: true, content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load all content" });
  }
};
