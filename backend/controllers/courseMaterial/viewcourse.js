import courseMaterial from "../../models/courseMaterial/courseMaterial.js";

export const getCourseContent = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }

    const content = await courseMaterial
      .find({ courseId })
      .sort({ createdAt: -1 });

    res.json({ success: true, content });
  } catch (err) {
    res.status(500).json({ message: "Failed to load content" });
  }
};
