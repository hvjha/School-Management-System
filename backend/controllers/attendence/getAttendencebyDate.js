import Attendance from "../../models/attendence/attendence.js";


const normalizeDate = (dateString) => {
  const date = new Date(dateString + 'T00:00:00.000Z');
  return date;
};
export const getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const { courseId } = req.query;

    const query = {
      date: normalizeDate(date),
    };

    if (courseId) {
      query.course = courseId;
    }

    const attendance = await Attendance.find(query)
      .populate({
        path: "student",
        select: "name studentId email",
      })
      .populate({
        path: "course",
        select: "name courseId",
      })
      .populate({
        path: "markedBy",
        select: "name trainerId",
      });

    return res.status(200).json({ attendance });
  } catch (err) {
    console.error("Get attendance by date error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};