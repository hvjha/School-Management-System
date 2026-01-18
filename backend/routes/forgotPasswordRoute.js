import express from 'express'

import { forgotPasswordQuestion } from '../controllers/passwordreset/passwordResetquestion.js';
import { forgotPasswordVerify } from '../controllers/passwordreset/passwordverify.js';
import { forgotPasswordReset } from '../controllers/passwordreset/passwordReset.js';

const forgotRoute = express.Router();

forgotRoute.post('/question',forgotPasswordQuestion);
forgotRoute.post('/verify',forgotPasswordVerify);
forgotRoute.post('/reset',forgotPasswordReset)

export default forgotRoute