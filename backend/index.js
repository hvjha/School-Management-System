import express from 'express'
import 'dotenv/config'
import connectDB from './config/db.js';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import authRouter from './routes/authRoute.js';
import forgotRoute from './routes/forgotPasswordRoute.js';
import adminRoute from './routes/adminRoutes.js';
import courseRoute from './routes/courseRoute.js';
import seedSuperadmin from './utils/seedSuperadmin.js';
import contentRoute from './routes/courseContentRoutes.js';
import attendenceRoute from './routes/attendenceRoute.js';
import libraryRoute from './routes/libraryRoute.js';
import fineRoute from './routes/fineRoute.js';
import helmet from "helmet";
import compression from "compression";

const app = express()

const PORT = process.env.PORT || 4000;
connectDB()

app.use(express.json());
app.use(cookieParser())
app.use(express.json({ limit: "2gb" }));
app.use(express.urlencoded({ extended: true, limit: "2gb" }));
app.use(helmet());
app.use(compression());

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

app.get('/', (req, res) => {
  res.send("API CALLED")
})

app.use('/api/auth', authRouter)
app.use('/api/forgot-password', forgotRoute)
app.use('/api/admin', adminRoute)
app.use('/api/course', courseRoute)
app.use('/api/content', contentRoute)
app.use('/api/attendance', attendenceRoute)
app.use('/api/library', libraryRoute)
app.use('/api/fine', fineRoute)

const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await seedSuperadmin();
});

server.setTimeout(15 * 60 * 1000); 
