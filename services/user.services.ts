import { Response } from "express";
import { User } from "../models/user.mode";
import { redisClient } from "../utils/redis";

export const getUserById =async(res:Response,userId:string)=>{
    const decoded = await redisClient().get(userId);
    const user = JSON.parse(decoded as string);
    res.status(200).json({
        success:true,
        user
    });
}