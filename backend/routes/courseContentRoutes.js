import express from 'express'
import authToken from '../middlewares/authMiddleware.js'
import { permit } from '../middlewares/roleMiddleware.js'
import { uploadCourseMaterial } from '../controllers/courseMaterial/uploadCourse.js'
import { getCourseContent } from '../controllers/courseMaterial/viewcourse.js'
import { getAllCourseContent } from '../controllers/courseMaterial/viewAllCourse.js'
import { deleteContent } from '../controllers/courseMaterial/deleteCourse.js'


const contentRoute = express.Router()

contentRoute.post('/upload',authToken,permit('superadmin', 'trainer'),uploadCourseMaterial)
contentRoute.get('/list/:courseId',getCourseContent)
contentRoute.get('/all',getAllCourseContent)
contentRoute.delete('/delete/:id',authToken,permit('superadmin'),deleteContent)

export default contentRoute