import { app } from "./app";
import { connectDB } from "./utils/db";
import {v2 as cloudinary}  from "cloudinary";

require("dotenv").config();

//configure cloudinary

cloudinary.config({
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_SECRET_KEY,
    cloud_name:process.env.CLOUD_NAME

})

//listing on port

app.listen(process.env.PORT,():void=>{
    console.log(`Server is running on port ${process.env.PORT}`)
    connectDB();
})