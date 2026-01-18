import asyncHandler from 'express-async-handler'
import userModel from '../../models/user/userModel.js';
import courseModel from '../../models/course/courseModel.js';
export const getFullUserCourseDetails = asyncHandler(async (req, res) => {
  if (!["superadmin", "trainer"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Only superadmin or trainer can access full user details",
    });
  }

  // Fetch all users
  const users = await userModel
    .find()
    .select("-password -securityAnswerHash")
    .lean();

  // Fetch all courses with trainers + students + trainer-student map
  const courses = await courseModel
    .find()
    .populate("trainers", "name email trainerId phone")
    .populate("students", "name email studentId phone")
    .populate({
      path: "trainerStudentMap",
      populate: [
        { path: "trainer", select: "name email trainerId phone" },
        { path: "students", select: "name email studentId phone" },
      ],
    })
    .lean();

  // ---- Organize student course data ----
  const students = users.filter((u) => u.role === "student");
  const trainers = users.filter((u) => u.role === "trainer");
  const superadmins = users.filter((u) => u.role === "superadmin");
  const studentCount = await userModel.countDocuments({ role: "student" });

  // Map students with their enrolled courses
  const studentDetails = students.map((student) => {
    const enrolledCourses = courses
      .filter((c) =>
        c.students.some((s) => s._id.toString() === student._id.toString())
      )
      .map((course) => {
        const trainerMap = course.trainerStudentMap.find((m) =>
          m.students.some((s) => s._id.toString() === student._id.toString())
        );

        return {
          courseId: course.courseId,
          name: course.name,
          price: course.price,
          trainer: trainerMap ? trainerMap.trainer : null,
        };
      });

    return {
      ...student,
      enrolledCourses,
      totalCourses: enrolledCourses.length,
    };
  });

  // Map trainers with courses they teach + students under each trainer
  const trainerDetails = trainers.map((trainer) => {
    const teachingCourses = courses
      .filter((c) =>
        c.trainers.some((t) => t?._id.toString() === trainer?._id.toString())
      )
      .map((course) => {
        const trainerMap = course.trainerStudentMap.find(
          (m) => m.trainer?._id.toString() === trainer?._id.toString()
        );

        return {
          courseId: course.courseId,
          name: course.name,
          totalStudents: trainerMap ? trainerMap.students.length : 0,
          students: trainerMap ? trainerMap.students : [],
        };
      });

    return {
      ...trainer,
      teachingCourses,
      totalCourses: teachingCourses.length,
    };
  });

  res.json({
    success: true,
    totalUsers: users.length,
    totalStudents: students.length,
    totalTrainers: trainers.length,
    users: {
      students: studentDetails,
      trainers: trainerDetails,
      superadmins: superadmins,
    },
  });
});
