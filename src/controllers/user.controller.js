import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, res) => {
    //  res.status(500).json({
    //      message: "chai aur code"
    //  })

   const { fullName, email, username, password } = req.body
   console.log("email:" , email);


    if ([fullName, email, username, password ].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All field are required")
    }


    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username is already existed")
    }

   const avatarLocalPath =  req.files?.avatar[0]?.path;
   const coverImageLocalPath =  req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, " Avatar File is Required ")
    }

    //Uploading in the Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, " Avatar File is Required ")
    }


    const User = await User.create({
        fullName, 
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
    })



    const createdUser = await User.findById(User._id).select(
        "-passowrd -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Searching went wrong while registering the user")
    }



    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Succesfully")
    )
} )


export {
    registerUser,
}










