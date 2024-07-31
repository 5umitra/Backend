import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const commentSchema = new Schema({
    
    content: {
        type: string,
        required: true
    },
    video: {
        type: Schema.Types.ObjectId,
        ref : "video"
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    
}, {timestamps: true})




commentSchema.plugin(mongooseAggregatePaginate)

export const commment = mongoose.model("comment:", commentSchema)