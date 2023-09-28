import e, { Request, Response, NextFunction } from "express";
require("dotenv").config();
import { IUser, User } from "../models/user.mode";

import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsycError } from "../middleware/catchAyncError";
import Jwt, { JwtPayload, Secret } from "jsonwebtoken";
import {
  accessTokenOptions,
  refreshTokenOption,
  sendToken,
} from "../utils/jwt";
import { redisClient } from "../utils/redis";
import { getUserById } from "../services/user.services";

import cloudinary from "cloudinary";

export interface IGetUserAuthInfoRequest {
  name: string;
  email: string;
  password: string;
  avatar?: {
    public_id: string;
    url: string;
  };
}

//register a user
export const registerUser = CatchAsycError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;
      const checkUserExist = await User.findOne({ email });
      if (checkUserExist) {
        return next(new ErrorHandler(400, "User already exists"));
      }
      const user = await User.create({
        name,
        email,
        password,
      });

      console.log(user);

      const createActivationToken = createActivateionToken(user);
      console.log(createActivateionToken);
      res.status(201).json({
        success: true,
        message: "User created successfully",
        createActivationToken,
      });
    } catch (error) {
      console.log(error);
      return next(new ErrorHandler(500, error.message));
    }
  }
);

export interface IActivationToken {
  token: string;
  ActivationToken: string;
}

const createActivateionToken = (user: any): IActivationToken => {
  console.log("user", user);
  const token = Math.floor(10000 + Math.random() * 9000).toString();
  const ActivationToken = Jwt.sign(
    {
      user,
      token,
    },
    process.env.JWT_ACTIVATION_TOKEN_SECRET as Secret,
    {
      expiresIn: "5m",
    }
  );
  console.log(ActivationToken, token);
  return { token, ActivationToken };
};

//activate a user

export const activateUser = CatchAsycError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ActivationCode, ActivationToken } = req.body;
      const newUser: { user: IUser; token: string } = Jwt.verify(
        ActivationToken,
        process.env.JWT_ACTIVATION_TOKEN_SECRET as Secret
      ) as { user: IUser; token: string };
      const newUserToken = newUser.token;
      if (ActivationCode !== newUserToken) {
        return next(new ErrorHandler(400, "Invalid token"));
      }

      const user = newUser.user;
      const checkUserExist = await User.findOne({ email: user.email }).then(
        (user) => user as IUser
      );

      if (!checkUserExist) {
        return next(new ErrorHandler(400, "User not found"));
      }

      if (checkUserExist && checkUserExist.status) {
        return next(new ErrorHandler(400, "User already activated"));
      }

      const updateUser = await User.findByIdAndUpdate(
        checkUserExist._id,
        { status: true },
        { new: true }
      ).then((user) => user as IUser);
      res.status(200).json({
        success: true,
        message: "User activated successfully",
        updateUser,
      });
    } catch (error) {
      return next(new ErrorHandler(500, error.message));
    }
  }
);

//login  user

export interface ILoginRequest {
  email: string;
  password: string;
}

export const loginUser = CatchAsycError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as ILoginRequest;
      if (!email || !password) {
        return next(new ErrorHandler(400, "Please enter email and password"));
      }
      const checkUserExist = await User.findOne({ email }).select("+password");
      console.log(checkUserExist);
      if (!checkUserExist) {
        return next(new ErrorHandler(400, "Invalid email or password"));
      }

      if (!checkUserExist.status) {
        return next(new ErrorHandler(400, "User not activated"));
      }

      const isPasswordMatched = await checkUserExist.comparePassword(password);
      console.log(isPasswordMatched);

      if (!isPasswordMatched) {
        return next(new ErrorHandler(400, "Invalid email or password"));
      }

      sendToken(checkUserExist, 200, res);
    } catch (error) {
      console.log(error);
      return next(new ErrorHandler(500, error.message));
    }
  }
);

//logout user
export const logoutUser = CatchAsycError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie("access_token", "", { maxAge: 1 });
      res.cookie("refresh_token", "", { maxAge: 1 });
      const userId = req.user._id || "";

      redisClient().del(userId);

      res.status(200).json({
        success: true,
        message: "Logout successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(500, error.message));
    }
  }
);

export const checkReq = CatchAsycError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(req);
      return res.json({
        req: req.cookies,
      });
    } catch (error) {
      return next(new ErrorHandler(500, error.message));
    }
  }
);

export const updateAccessToken = CatchAsycError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refresh_token } = req.cookies;
      console.log("refresh", refresh_token);
      if (!refresh_token) {
        return next(
          new ErrorHandler(401, "Please login to access this resource")
        );
      }

      const decoded = Jwt.verify(
        refresh_token,
        process.env.REFRESH_TOKEN as Secret
      ) as JwtPayload;
      if (!decoded) {
        return next(new ErrorHandler(401, "Refresh token is invalid"));
      }

      const user = await redisClient().get(decoded.id);
      if (!user) {
        return next(new ErrorHandler(401, "User not found"));
      }

      const decodedUser = JSON.parse(user);
      const updateAccessToken = Jwt.sign(
        { id: decodedUser._id },
        process.env.ACCESS_TOKEN as Secret,
        {
          expiresIn: "5m",
        }
      );
      const updateRefreshToken = Jwt.sign(
        { id: decodedUser._id },
        process.env.REFRESH_TOKEN as Secret,
        {
          expiresIn: "3d",
        }
      );
      req.user=decodedUser;
      res.cookie("access_token", updateAccessToken, accessTokenOptions);
      res.cookie("refresh_token", updateRefreshToken, refreshTokenOption);

      res.status(200).json({
        success: true,
        message: "Access token updated successfully",
        updateAccessToken,
        updateRefreshToken,
      });
    } catch (error) {
      return next(new ErrorHandler(500, error.message));
    }
  }
);



//getting userby id

export const getUser = CatchAsycError(async(req:Request,res:Response,next:NextFunction)=>{

  try {
    const userId = req.user?._id;
    getUserById(res,userId);

  } catch (error) {
    return next(new ErrorHandler(500,error.message));
  }

})


export const updateAvatar = CatchAsycError(async(req:Request,res:Response,next:NextFunction)=>{

  try {
    const userId = req.user._id;
    const avatar = req.body.avatar;
    if(!avatar){
      return next(new ErrorHandler(400,"Please upload a file"));
    }

    const user = await User.findByIdAndUpdate(userId);
    if(user.avatar.public_id){
      await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    }
    const result = await cloudinary.v2.uploader.upload(avatar,{
      folder:"avatars",
      width:150,
      crop:"scale"
    });
    const updateAvatar = {
      public_id:result.public_id,
      url:result.secure_url
    }
    user.avatar = updateAvatar;

    await user.save();
    await redisClient().set(userId,JSON.stringify(user));
    res.status(200).json({
      success:true, 
      message:"Avatar updated successfully",
      updateAvatar
    })

  } catch (error) {
    console.log(error);
    return next(new ErrorHandler(500,error.message));
  }
})