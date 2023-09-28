import mongoose, { Schema } from "mongoose";

export interface IComment extends Document{
    user:Object;
    comment:string;
}

export interface IReview extends Document{
    user:Object;
    rating:number;
    comment:string;
    replies:IComment[];
}

export interface ILink extends Document{
    title:string;
    url:string;
}

export interface ICourseData extends Document{
    title:string;
    description:string;
    videoUrl:string;
    videoThumbnail:{
        public_id:string;
        url:string;
    };
    videoSection:string;
    videoLength:number;
    videoPlayer:string;
    link:ILink[]
    suggestion:string;
    questions:IComment[];
    
    };

    export interface ICourse extends Document{
        name:string;
        description:string;
        price:number;
        estimatedPrice?:number;
        thumbnails:{
            public_id:string;
            url:string;
        };
        tags:string;
        level:string;
        demoVideoUrl:string;
        benefits:{title:string}[];
        prerequisites:{title:string}[];
        reviews:IReview[];
        courseData:ICourseData[];
        rating?:number;
        purchaseCount?:number;

    }



    const CommentSchema:Schema<IComment> = new mongoose.Schema({
        user:{
            type:mongoose.Types.ObjectId,
            ref:"User"
        },
        comment:{
            type:String,
            
        }

    },{timestamps:true});

    const ReviewSchema:Schema<IReview> = new mongoose.Schema({
        user:{
            type:mongoose.Types.ObjectId,
            ref:"User"
        },
        rating:{
            type:Number,
            default:0

        },
        comment:{
            type:String,
        },
        replies:[CommentSchema]
    },{timestamps:true});
    
    const LinkSchema:Schema<ILink> = new mongoose.Schema({
        title:{
            type:String,
            required:[true,"Please add a title"]
        },
        url:{
            type:String,
            required:[true,"Please add a url"]
        }
    },{timestamps:true});

    const CourseDataSchema:Schema<ICourseData> = new mongoose.Schema({
        title:{
            type:String,
            required:[true,"Please add a title"]
        },
        description:{
            type:String,
            required:[true,"Please add a description"]
        },
        videoUrl:{
            type:String,
        },
        videoThumbnail:{
            public_id:{
                type:String,
            },
            url:{
                type:String,
            }
        },
        videoSection:{
            type:String,
        },
        videoLength:{
            type:Number,
        },
        videoPlayer:{
            type:String,
         
        },
        link:[LinkSchema],
        suggestion:{
            type:String,
        },
        questions:[CommentSchema]
    },{timestamps:true});   



    const CourseSchema:Schema<ICourse> = new mongoose.Schema({
        name:{
            type:String,
            required:[true,"Please add a name"]
        },
        description:{
            type:String,
            required:[true,"Please add a description"]
        },
        price:{
            type:Number,
            required:[true,"Please add a price"]
        },
        estimatedPrice:{
            type:Number
        },
        thumbnails:{
            public_id:{
                type:String,
            },
            url:{
                type:String,
            }
        },
        tags:{
            type:String,
        },
        level:{
            type:String,
        },
        demoVideoUrl:{
            type:String,
        },
        benefits:[{title:{type:String}}],
        prerequisites:[{title:{type:String}}],
        reviews:[ReviewSchema],
        courseData:[CourseDataSchema],
        rating:{
            type:Number,
            default:0
        },
        purchaseCount:{
            type:Number,
            default:0
        }


    },{timestamps:true});
    const courseModel =  mongoose.model<ICourse>("Course",CourseSchema);

    export default courseModel;


    

