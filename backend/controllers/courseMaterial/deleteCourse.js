import courseMaterial from "../../models/courseMaterial/courseMaterial.js";

export const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;

    const content = await courseMaterial.findById(id);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    await content.deleteOne();

    return res.json({
      success: true,
      message: "Content deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};