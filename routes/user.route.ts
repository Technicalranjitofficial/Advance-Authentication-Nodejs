import express from "express";
import { activateUser, checkReq, getUser, loginUser, logoutUser, registerUser, updateAccessToken, updateAvatar } from "../controller/user.controller";
import { authoRizeRoles, isAuthenticated } from "../middleware/auth";

const userRouter = express.Router();

userRouter.post("/register",registerUser);
userRouter.post("/activate",activateUser);
userRouter.post("/login",loginUser);
userRouter.post("/logout",isAuthenticated, logoutUser);
userRouter.post("/check",isAuthenticated,authoRizeRoles("admin"),checkReq);
userRouter.post("/refresh",updateAccessToken);
userRouter.post("/me",isAuthenticated
,getUser);

userRouter.post("/updateAvatar",isAuthenticated
,updateAvatar);



export default userRouter

