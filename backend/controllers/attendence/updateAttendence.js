import Attendance from "../../models/attendence/attendence.js";
export const updateAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { status } = req.body;

    if (!["present", "absent"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be 'present' or 'absent'",
      });
    }

    const attendance = await Attendance.findByIdAndUpdate(
      attendanceId,
      { status },
      { new: true }
    )
      .populate("student", "name studentId")
      .populate("course", "name courseId");

    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    return res.status(200).json({
      message: "Attendance updated successfully",
      attendance,
    });
  } catch (err) {
    console.error("Update attendance error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};