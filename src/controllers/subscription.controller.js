import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!isValidObjectId(channelId)){
        throw new ApiError(401, "The channel Id is invalid")
    }

    const subscribed = await Subscription.findOne(
        { subscriber: req.user?._id },
        { channel: channelId }
    )

    let flag;
    if(!subscribed){
        const removedsubscription = await Subscription.findByIdAndDelete(subscribed?._id);
        if(!removedsubscription){
            throw new ApiError(501, " Something went wrong while subscribing ")
        }
        flag = false

    }

    else{
        const newsubscriber = await Subscription.create(
            {
                channel : new mongoose.Types.ObjectId(channelId),
                subscriber: req.user?._id

            }
        )

        if(!newsubscriber){
            throe new ApiError(501, "Something went wrong while subscribing channel")
        }

        flag = true
    }


    return res
    .status(200)
    .json(
        new ApiResponse(200, { isSubscribed: flag }, "Subscription toggled successfully")
    )
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}