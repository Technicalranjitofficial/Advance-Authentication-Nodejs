import { NextFunction, Request, Response } from "express";
import { CatchAsycError } from "./catchAyncError";
import ErrorHandler from "../utils/ErrorHandler";
require("dotenv").config();

import  Jwt, { JwtPayload }  from "jsonwebtoken";
import { redisClient } from "../utils/redis";

export const isAuthenticated = CatchAsycError(async (req: Request, res: Response, next: NextFunction) => {

    const { access_token } = req.cookies;

    console.log("cookies",access_token);

    if(!access_token){
        return next(new ErrorHandler(401,"Please login to access this resource"));
    }
    const decoded =  Jwt.verify(access_token,process.env.ACCESS_TOKEN as string) as JwtPayload;
    if(!decoded){
        return next(new ErrorHandler(401,"Access Token is invalid"));
    }
   const user = await redisClient().get(decoded.id);

   if(!user){
       return next(new ErrorHandler(401,"User not found"));
   }

   req.user = JSON.parse(user);
    next();

    
})


export const authoRizeRoles = (...roles:string[])=>(req:Request,res:Response,next:NextFunction)=>{
    if(!roles.includes(req.user?.role||"")){
        return next(new ErrorHandler(403,`Role ${req.user.role} is not allowed to access this resource`));
    }
    next();
}