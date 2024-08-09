import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken; // User ne refresh token ko liya le
        await user.save({ validateBeforeSave: false }); // refresh token ko db mein save karwa liya

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, `Something went wrong during the generation of refresh and access token: ${String(error)}`);
    }
};

 

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    }); 

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    );
});



const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "username or email is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        );
});



const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1    //removes fiels from documents
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"));
});


const RefreshAccessToken = asyncHandler(async (req, res) => {

const incomingRefreshToken =
req.cookies.refreshToken || req.body.refreshToken

if(!incomingRefreshToken){
    throw new ApiError(401, "Unauthorized Access!!")
}


try {
    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET   //here the incomingrefreshtoken converts into the decoded token
    )
    
    
    const user = await User.findById(decodedToken?._id)
    
    if(!user){
        throw new ApiError(401, " INvalid Refresh TOken")
    }
    
    
    if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401, "Refresh Token is expired or used")
    }
    
    const options = {
        httpOnly : true,
        secure : true
    }
    
    const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
    return res
    .status(200)
    .cookies("accessToken", accessToken, options)
    .cookies("refreshtoken", newRefreshToken, options)
    .json(
        new ApiResponse(
            200,
            {accessToken, refreshToken: newRefreshToken},
            "Access Token Refreshed"
        )
    )
} catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh TOken")
}

 
})


const changeCurrentPassword = asyncHandler(async (req, res) => {

    const{oldPassowrd, newPassowrd} = req.body

   const user = await User.findById(req.user?._id)     //id ke basis pe user find kar sakte hain
   const isPasswordCorrect = await user.isPasswordCorrect(oldPassowrd) 
   
  if (!isPasswordCorrect) {
       throw new ApiError(400, "Old Password is invalid")
  }

  user.password = newPassowrd
  await user.save({validateBeforeSave: false})


  return res  
  .status(200)
  .json(new ApiError(200, {}, "Password changes Successssssfully"))


})


const getCurrentUser = asyncHandler(async (req, res) => {
    const userId = req.user.id; // Assuming user ID is stored in req.user
    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current User fetched successfully"));
});



const updateAccountDetails = asyncHandler (async (req, res) => {
   const {fullName, email } = req.body

   if (!fullName || !email) {
       throw new ApiError(400, "All fiels are required")
   }


   const user = await User.findByIdAndUpdate(
   req.user?._id,
   {
        $set: {
            fullName: fullName,
            email: email
        }
   },
   {new: true}
 ).select("-password")


return res
.status(200)
.json(new ApiResponse(200, user, "Account Details update successfully"))

})



const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }


    const avatar = await uploadOnCloudinary(avatarLocalPath)    //purana image delete karne ke liye

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")
    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )

})


const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)   //delete old cover image

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")
    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover image updated successfully")
    )
})



const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username} = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})

const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})


export {
    registerUser,
    loginUser,
    logoutUser,
    RefreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
};