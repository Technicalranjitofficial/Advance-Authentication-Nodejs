import expres, { NextFunction, Request, Response } from "express"
export const app = expres();
import cookieParser from "cookie-parser";
import cors from "cors"
require("dotenv").config()
import { ErrorMiddleware } from "./middleware/error";
import userRouter from "./routes/user.route";
import courseRouter from "./routes/course.route";
//cookie-parser
app.use(cookieParser())

// cors=>cross origin resource sharing
app.use(cors({
    origin:"*"
  
}));

// body parser
app.use(expres.json({limit:"50mb"}))

// routes

app.use("/api/v1",userRouter);
app.use("/api/v1",courseRouter);

app.get("/",(req:Request,res:Response,next:NextFunction)=>{
    res.status(200).json({
        success:true,
        message:"Api is working",
    })

})

//unknown routes
app.all("*",(req:Request,res:Response,next:NextFunction)=>{
  const err = new Error(`Requested url ${req.url} not found`) as any;
  err.statusCode = 404;
    next(err)
});




app.use(ErrorMiddleware);
