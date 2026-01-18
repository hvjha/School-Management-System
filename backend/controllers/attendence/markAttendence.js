import Attendance from "../../models/attendence/attendence.js";
import courseModel from "../../models/course/courseModel.js";
import userModel from "../../models/user/userModel.js";

const normalizeDate = (dateString) => {
  const date = new Date(dateString + 'T00:00:00.000Z');
  return date;
};

// Mark Attendance
export const markAttendance = async (req, res) => {
  try {
    const { studentId, courseId, date, status } = req.body;

    if (!studentId || !courseId || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Fetch student and course by Mongo _id
    const student = await userModel.findById(studentId);
    const course = await courseModel.findById(courseId);

    if (!student) return res.status(404).json({ message: "Student not found" });
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Check if student is enrolled using Mongo _id
    const isEnrolled = course.students.some(
      (s) => s.toString() === student._id.toString()
    );
    if (!isEnrolled) {
      return res.status(400).json({
        message: "Student not enrolled in this course",
      });
    }

    // Normalize date to UTC midnight
    const attendanceDate = normalizeDate(date);
    
    // Check if date is Sunday (0 = Sunday in UTC)
    if (attendanceDate.getUTCDay() === 0) {
      return res.status(400).json({
        success: false,
        message: "Attendance cannot be marked on Sunday",
      });
    }

    // Check if date is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (attendanceDate > today) {
      return res.status(400).json({
        success: false,
        message: "Cannot mark attendance for future dates",
      });
    }

    // Prevent duplicate attendance for the same date
    const existing = await Attendance.findOne({
      course: course._id,
      student: student._id,
      date: attendanceDate,
    });

    if (existing) {
      return res.status(400).json({
        message: "Attendance already marked for this date",
      });
    }

    // Create attendance
    const attendance = await Attendance.create({
      course: course._id,
      student: student._id,
      date: attendanceDate,
      status: status || "present",
      markedBy: req.user._id,
    });

    // Populate for response
    await attendance.populate([
      { path: 'course', select: 'name courseId' },
      { path: 'student', select: 'name studentId email' },
      { path: 'markedBy', select: 'name trainerId' }
    ]);

    return res.status(201).json({
      message: "Attendance marked successfully",
      attendance,
    });
  } catch (err) {
    console.error("Attendance error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};