import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!isValidObjectId(videoId)){
        throw new ApiError(401, "Invalid video id")
    }

    const like = await Like.findOne({
        video : new mongoose.Types.ObjectId(videoId),
        likedby : req.user?._id
    })


    let isLiked;
    if(like){
        const deleteLike = await Like.findByIdAndDelete(like._id)

        if(!deleteLike){
            throw new ApiError(501, "Something went wrong while disliking the video")
        }

        isLiked = true;
    }
    {
        const addLike = await Like.create({
            video: new mongoose.Types.ObjectId(videoId),
            likedby: req.user?._id
        });

        if(!addLike){
            throw new ApiError(401, "something went wrong while liking on the video")
        }

        isLiked = true;
    }

    return res
    .status(200)
    .json(200, { isLiked }, "Video's liked successfully!!")

})


const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    if(isValidObjectId(commentId)){
        throw new ApiError(401, " This commentId is unvalid ")
    }


    const like = await Like.findOne({
        comment : new mongoose.types.ObjectId(like._id),
        liked : user.req?._id
    })


    let isLiked;
    if(like){
        deletedlike = await Like.findByIdAndDelete(like._id)

        if(!deletedlike){
            throw new ApiError(401, " Something went wrong while deleting the likes from the comment ")
        }

        isLiked = true;
    }

    else{
        const addedLike = await Like.create({
            comment : new mongoose.Types.ObjectId(commentId),
            likedby : req.user?._id
        })

        if(!addedLike){
            throw new ApiError(401, " Something went wrong while liking on the comment! ")
        }


    }

    return res
    .status(200)
    .json(200, { isLiked }, "Comment's liked successfulyy" )

})






















const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}









