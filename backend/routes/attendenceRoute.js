import express from "express";

const attendenceRoute = express.Router();

import authToken from "../middlewares/authMiddleware.js";
import { markAttendance } from "../controllers/attendence/markAttendence.js";
import { getStudentAttendance } from "../controllers/attendence/getStudent Attendence.js";
import { getCourseAttendance } from "../controllers/attendence/getCourseAttendence.js";
import { getAttendanceByDate } from "../controllers/attendence/getAttendencebyDate.js";
import { updateAttendance } from "../controllers/attendence/updateAttendence.js";
import { deleteAttendance } from "../controllers/attendence/deleteAttendence.js";


// Mark attendance (Trainers only)
attendenceRoute.post("/mark", authToken, markAttendance);

// Get student attendance by studentId (custom ID like "STU001")
attendenceRoute.get("/student/:studentId", authToken, getStudentAttendance);

// Get course attendance
attendenceRoute.get("/course/:courseId", authToken, getCourseAttendance);

// Get attendance by date (with optional course filter)
attendenceRoute.get("/date/:date", authToken, getAttendanceByDate);

// Update attendance status
attendenceRoute.put("/:attendanceId", authToken, updateAttendance);

// Delete attendance
attendenceRoute.delete("/:attendanceId", authToken, deleteAttendance);

export default attendenceRoute;