import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const{ content } = req.body

    if(!content){
        throw new ApiError(401, " Content is required " )
    }

    const tweet = new Tweet.create({
        content : content,
        owner : Schema.Types.ObjectId(req.User?._id)
    })

    if(!tweet){
        throw new ApiError(501, " something went wrong while creating tweet")
    }


    res.status(200)
    .json(
        new ApiResponse(200, tweet, "tweet created successfully")
    )

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.body


    if(!isValidObjectId(userId)){
        throw new ApiError(401, "User is not VAlid")
    }

    const tweets = await Tweet.aggregate([
        {
            $match : {
                owner: mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup : {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes"
            }
        },
        {
            $addFields: {
                likescount : {$size : "$likes"}
            }
        },
        {
            $project : {
                content : 1,
                likescount: 1,
                _id: 1,
                owner: 1
            }
        }
    ])

    if(!tweets){
        throw new ApiError(401, " No tweets found ")
    }

    res.status(200)
    .json(
        new ApiResponse(200, "tweets", "All the tweets fetched successfully!!")
    )

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}




