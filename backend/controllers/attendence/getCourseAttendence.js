import Attendance from "../../models/attendence/attendence.js";
import courseModel from "../../models/course/courseModel.js";

const normalizeDate = (dateString) => {
  const date = new Date(dateString + 'T00:00:00.000Z');
  return date;
};

export const getCourseAttendance = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { month, year, date } = req.query;

    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Build query
    const query = { course: courseId };

    // Filter by specific date
    if (date) {
      const specificDate = normalizeDate(date);
      query.date = specificDate;
    }
    // Filter by month/year
    else if (month && year) {
      const startDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1));
      const endDate = new Date(Date.UTC(parseInt(year), parseInt(month), 0, 23, 59, 59, 999));
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .populate({
        path: "student",
        select: "name studentId email",
      })
      .populate({
        path: "markedBy",
        select: "name trainerId",
      })
      .sort({ date: -1 });

    return res.status(200).json({
      course: {
        _id: course._id,
        name: course.name,
        courseId: course.courseId,
      },
      attendance,
    });
  } catch (err) {
    console.error("Get course attendance error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
