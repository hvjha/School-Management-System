import mongoose from "mongoose";

const courseMaterialSchema = new mongoose.Schema({
  courseId: {
    type: String,        // DSA-101
    required: true,
  },

  title: { type: String, required: true },
  description: { type: String },

  file_url: { type: String, required: true },

  file_type: {
    type: String,
    enum: ["video", "pdf", "image", "document"],
    required: true,
  },

  thumbnail_url: { type: String },

  duration: {
    type: Number,     
    default: 0,
  },

  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("courseMaterial", courseMaterialSchema);
