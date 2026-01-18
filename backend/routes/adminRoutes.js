import express from 'express'
import authToken from '../middlewares/authMiddleware.js';
import { permit } from '../middlewares/roleMiddleware.js';
import { createUser } from '../controllers/admin/createUser.js';
import { getAllusers } from '../controllers/admin/allUsers.js';
import { getUserById } from '../controllers/admin/user.js';
import { getFullUserCourseDetails } from '../controllers/admin/FullUsersDetails.js';
import { updateUser } from '../controllers/admin/updateuser.js';
import { getAllTrainers } from '../controllers/admin/allTrainer.js';
import { deleteUser } from '../controllers/admin/deleteUser.js';

import { getPublicStats } from '../controllers/admin/publicStats.js';

const adminRoute = express.Router()

adminRoute.get('/public/stats', getPublicStats);
adminRoute.post('/create-user',authToken,permit("superadmin"),createUser);
adminRoute.get('/users',authToken,getAllusers);
adminRoute.get('/user/:id',authToken,getUserById);
adminRoute.get('/user-details',authToken,permit('superadmin', 'trainer'),getFullUserCourseDetails)
adminRoute.post('/update-user/:id',authToken,permit('superadmin','student'),updateUser);
adminRoute.delete('/delete/:id',authToken,permit('superadmin'),deleteUser)
adminRoute.get("/get-all-trainers", authToken, getAllTrainers);


export default adminRoute;