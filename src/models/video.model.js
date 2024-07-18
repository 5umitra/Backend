import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
 
const videoSchema = new Schema (
    {
        videoFile : {
            type : string, 
            required : true
        },
        thumbnail : {
            type : string, 
            required : true
        },
        title : {
            type : string, 
            required : true
        },
        Description : {
            type : string, 
            required : true
        },
        Duration : {
            type : Number, 
            required : true
        },
        views : {
            type : Number,
            default : 0
        },
        Published : {
            type : Boolean,
            default : true
        },
        owner : {
            type : Schema.Types.ObjectId,
            ref : "User"
        }
    } ,
    { 
        timestamps : true
    }
)


videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.Model("Video", videoSchema)