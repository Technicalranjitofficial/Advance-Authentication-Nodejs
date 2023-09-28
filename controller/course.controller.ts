import { NextFunction, Request, Response } from "express";
import { CatchAsycError } from "../middleware/catchAyncError";
import { createCourse } from "../services/course.services";
import ErrorHandler from "../utils/ErrorHandler";

export const uploadCourses = CatchAsycError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        console.log(data);
        const thumbnails = data.videoThumbnail;
        if(thumbnails){
            console.log(thumbnails);
        }
        createCourse(data,res,next);

        } catch (error) {
        return next(new ErrorHandler(500, error.message));
    }

})