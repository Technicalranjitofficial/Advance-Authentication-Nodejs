import { Redis } from "ioredis";
require("dotenv").config();

export const redisClient = ()=>{
   
   

    return Redis.createClient();

  
}

