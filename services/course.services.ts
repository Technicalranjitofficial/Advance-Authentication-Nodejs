import { NextFunction, Request, Response } from "express";
import { CatchAsycError } from "../middleware/catchAyncError";
import courseModel from "../models/courses.model";

export const createCourse = CatchAsycError(async (data:any, res: Response) => {
    try {
       const course = await courseModel.create(data);
       res.status(201).json({
              success:true,
              course    
         });
        } catch (error) {
        
            res.status(500).json({ 
                success:false,
                error:error.message
            });
    

        }});