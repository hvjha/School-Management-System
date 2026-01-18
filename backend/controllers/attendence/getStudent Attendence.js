import Attendance from "../../models/attendence/attendence.js";
import userModel from "../../models/user/userModel.js";

export const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { courseId, month, year } = req.query;

    // Find student by custom studentId field
    const student = await userModel.findOne({ studentId });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Generate all workdays (Mon-Sat) for the requested period
    const now = new Date();
    let startDate, endDate;

    if (month && year) {
      startDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1));
      endDate = new Date(Date.UTC(parseInt(year), parseInt(month), 0, 23, 59, 59, 999));
    } else {
      // Default to last 30 days if no period provided
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      endDate = new Date();
    }

    // Limit endDate to today
    const effectiveEndDate = endDate > now ? now : endDate;
    
    // Build query for actual database records
    const query = { student: student._id };
    if (courseId) query.course = courseId;
    if (month && year) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    // Fetch all attendance records for this student
    const attendance = await Attendance.find(query)
      .populate({ path: "course", select: "name courseId" })
      .populate({ path: "markedBy", select: "name trainerId" })
      .sort({ date: -1 });

    // Create a Set of existing record dates for O(1) lookup
    const recordDates = new Set(attendance.map(a => new Date(a.date).toISOString().split('T')[0]));

    let implicitAbsents = 0;
    let totalWorkDaysCount = 0;

    let current = new Date(startDate);
    current.setHours(0, 0, 0, 0);

    while (current <= effectiveEndDate) {
      const dayOfWeek = current.getUTCDay();
      const dateStr = current.toISOString().split('T')[0];

      if (dayOfWeek !== 0) { // Not Sunday
        totalWorkDaysCount++;
        if (!recordDates.has(dateStr)) {
          implicitAbsents++;
        }
      }
      current.setUTCDate(current.getUTCDate() + 1);
    }

    // Calculate overall stats
    const presentDays = attendance.filter((a) => a.status === "present").length;
    const explicitAbsentDays = attendance.filter((a) => a.status === "absent").length;
    const totalAbsentDays = explicitAbsentDays + implicitAbsents;
    const totalDaysConsidered = presentDays + totalAbsentDays;

    const attendancePercentage =
      totalDaysConsidered > 0 ? ((presentDays / totalDaysConsidered) * 100).toFixed(2) : 0;

    return res.status(200).json({
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        profile_pic: student.profile_pic,
        studentId: student.studentId,
      },
      attendance,
      implicitAbsents, // Sending this for frontend awareness
      stats: {
        totalDays: totalDaysConsidered,
        presentDays,
        absentDays: totalAbsentDays,
        attendancePercentage,
      },
    });
  } catch (err) {
    console.error("Get attendance error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
