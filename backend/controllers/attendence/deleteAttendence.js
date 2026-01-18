import Attendance from "../../models/attendence/attendence.js";

export const deleteAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;

    const attendance = await Attendance.findByIdAndDelete(attendanceId);

    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    return res.status(200).json({
      message: "Attendance deleted successfully",
    });
  } catch (err) {
    console.error("Delete attendance error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};