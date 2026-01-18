import express from 'express'
import authToken from '../middlewares/authMiddleware.js';
import { permit } from '../middlewares/roleMiddleware.js';
import { createCourse } from '../controllers/course/createCourse.js';
import { getAllCourse } from '../controllers/course/AllCourse.js';
import { enrollStudent } from '../controllers/course/enrollStudent.js';
import { getTrainerCourses } from '../controllers/course/trainerCourse.js';
import { getStudentCourses } from '../controllers/course/studentCourse.js';
import { updateCourse } from '../controllers/course/updateCourse.js';
import { deleteCourse } from '../controllers/course/deleteCourse.js';
import { removeStudentFromCourse } from '../controllers/course/removeStudentFromCourse.js';
import { removeCourseFromStudent } from '../controllers/course/removeCoursefromStudent.js';
import { assignTrainerToCourse } from '../controllers/course/assigntrainerToCourse.js';
import { removeTrainerFromCourse } from '../controllers/course/removeTrainerfromCourse.js';

const courseRoute = express.Router();

courseRoute.post('/course-create',authToken,permit('superadmin'),createCourse);
courseRoute.put('/update-course/:id',authToken,permit('superadmin'),updateCourse);
courseRoute.delete('/delete-course/:id',authToken,permit('superadmin'),deleteCourse);
courseRoute.put("/:courseId/remove-student", authToken,permit('superadmin'), removeStudentFromCourse);
courseRoute.put("/assign-trainer", authToken, permit("superadmin"), assignTrainerToCourse);
courseRoute.put("/remove-course-from-student",authToken, permit("superadmin"), removeCourseFromStudent);
courseRoute.get('/courses',getAllCourse);
courseRoute.post('/enroll/:courseId',authToken,permit('superadmin'),enrollStudent);
courseRoute.get('/trainer/my',authToken,permit('trainer'),getTrainerCourses)
courseRoute.get('/student/my',authToken,permit('student'),getStudentCourses)
courseRoute.put("/remove-trainer-from-course",authToken,permit("superadmin"),removeTrainerFromCourse);


export default courseRoute