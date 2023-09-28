import express from 'express';
import { uploadCourses } from '../controller/course.controller';
import { isAuthenticated } from '../middleware/auth';

const courseRouter = express.Router();

courseRouter.post("/upload",isAuthenticated,uploadCourses);

export default courseRouter;

