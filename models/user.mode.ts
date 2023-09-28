import mongoose, { Document, Model, Schema } from "mongoose";

import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
require("dotenv").config();

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  status: boolean;
  role: string;
  isVerified: boolean;
  courses: Array<{ courseId: string }>;
  comparePassword: (password: string) => Promise<boolean>;
  signInAccessToken: ()=> string;
  signInRefresToken: ()=> string;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      lowercase: true,
      validate: (value: string) => {
        const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
        return emailRegex.test(value);
      },
      message: "Please enter a valid email",
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minlength: 6,
      select: false,
    },
    avatar: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },

    role: {
      type: String,
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Boolean,
      default: false,
    },
    courses: [
      {
        courseId: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);


//hashing the password before saving the user
userSchema.pre<IUser>("save", async function (next) {  
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    });
// 

//compare password
userSchema.methods.comparePassword = async function (
  enteredPasswrod: string
): Promise<Boolean> {
  return await bcrypt.compare(enteredPasswrod, this.password);
};



//refresh token
userSchema.methods.signInRefresToken = function():string {
  return Jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN,{
    expiresIn:"3d"
  });
  
};

userSchema.methods.signInAccessToken = function ():string {
  return Jwt.sign({id:this._id},process.env.ACCESS_TOKEN,{
    expiresIn:"5m"
  })


}
export const User: Model<IUser> = mongoose.model("User", userSchema);