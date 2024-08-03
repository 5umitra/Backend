import mongoose, { Schema } from "mongoose";

const tweetSchema = new Schema({
    content: {
        type: String, // Use String with a capital 'S'
        required: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });

export const Tweet = mongoose.model("Tweet", tweetSchema); // Remove the trailing colon in the model name
