import { Router } from "express";
import { registerUser,
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
        } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT,  logoutUser)

router.route("/refresh-token").post(RefreshAccessToken)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar) 
//Yaha patch isiliye use kiya kyuki if patch use nahi karte toh sab kuch update ho jaata
//but humko yaha par sirf avatar change karna hain.

router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/history").get(verifyJWT, getWatchHistory)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
export default router