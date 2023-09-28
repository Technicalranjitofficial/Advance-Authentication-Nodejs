import { Response } from "express";
import { IUser } from "../models/user.mode";
import { redisClient } from "./redis";




const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE||'300',10);
const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '1200',10);

export const accessTokenOptions:ITokenOptions = {
    expiresIn: new Date(Date.now()+ accessTokenExpire *60 * 60 * 1000),
    maxAge: accessTokenExpire *60*60 *1000,
    httpOnly: true,
    sameSite: "lax",
    
}
export const refreshTokenOption:ITokenOptions = {
    expiresIn: new Date(Date.now()+ refreshTokenExpire *24 * 60*60 * 1000),
    maxAge: refreshTokenExpire *24 * 60*60 * 1000,
    httpOnly: true,
    sameSite: "lax",
    
}

export interface ITokenOptions {
    expiresIn: Date;
    maxAge: number;
    httpOnly: boolean;
    secure?: boolean;
    sameSite: "strict" | "lax" | "none" | undefined;
    }

    export const sendToken = async(user:IUser,statusCode:number,res:Response) => {
        console.log(user);

        console.log(user.signInAccessToken());
        const accessToekn = user.signInAccessToken();
        const refreshToken = user.signInRefresToken();

      const p =  redisClient().set(user._id,JSON.stringify(user));

        console.log("hey gust");


        if(process.env.NODE_ENV === "production"){
            accessTokenOptions.secure = true;
        }
        res.cookie("access_token",accessToekn,accessTokenOptions);
        res.cookie("refresh_token",refreshToken,refreshTokenOption);

        res.status(statusCode).json({
            success:true,
            message:"Login successfully",
            user,
            accessToekn,
            refreshToken,
        })


    }