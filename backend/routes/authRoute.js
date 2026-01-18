import express from 'express'
import { Register } from '../controllers/user/register.js';
import { login } from '../controllers/user/login.js';
import { logout } from '../controllers/user/logout.js';


const authRouter = express.Router();

authRouter.post('/register',Register);
authRouter.post('/login',login);
authRouter.post('/logout',logout)


export default authRouter