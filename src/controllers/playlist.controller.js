import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const userId = req.user.id; // Assuming the user ID is stored in the JWT and available in req.user

    if (!name || !description) {
        throw new ApiError(400, "Name and description are required for creating a playlist");
    }

    // Log userId for debugging
    console.log("Creating playlist for user ID:", userId);

    // Create a new playlist
    const playlist = new Playlist({
        name: name,
        description: description || "",
        owner: req.user._id,
        // user: userId,
    });

    // Save the playlist to the database
    await playlist.save();

    return res.status(201).json(
        new ApiResponse(201, playlist, "Playlist created successfully")
    );
});


// if(!name && ! description){
    //     throw new ApiError(400, "Username and Description are required for creating playlist");
    // }

    // const playlist = await playlist.create({
    //     username: username.toLowerCase(),
    //     description
    // }); 

    // const createdPlaylist = await User.findById(user._id).select("-password -refreshToken");


    //  if (!createdPlaylist) {
    //     throw new ApiError(500, "Something went wrong while ceating the playlist");
    // }


    // return res.status(201).json(
    //     new ApiResponse(200, createdUser, "Playlist created Successfully")
    // );

    //TODO: create playlist 


const getUserPlaylists = asyncHandler(async (req, res) => {
        const { userId } = req.params;
    
        // Validate userId
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid user ID");
        }
    
        // Fetch playlists from the database
        const playlist = await Playlist.find({ owner: userId });      //mini
    
        // Log the retrieved playlists for debugging
        //console.log("User ID:", userId);
       // console.log("Playlists found:", playlists);
    
        // Check if playlists are found
        if (!playlist) {
            throw new ApiError(404, "No playlists found for this user");
        }
    
        // Return the playlists
        return res.status(200).json(
            new ApiResponse(200, playlist, "Current User's playlists fetched successfully!")
        );
});
    

const getPlaylistById = asyncHandler(async (req, res) => {
        const { playlistId } = req.params
        //TODO: get playlist by id
    
        if (!isValidObjectId(playlistId)) {
            throw new ApiError(401, "Not a valid playlist id")
        }
    
        const playlist = await Playlist.findById(playlistId)
    
        if (!playlist) {
            throw new ApiError(501, "Not playlist found")
        }
    
        if (playlist.owner.toString() !== req.user?._id.toString()) {
            throw new ApiError(401, "you cannot access the playlist as you are not the fucking owner")
        }
    
        res.status(200).json(
            new ApiResponse(200, playlist, "Playlist fetched successfully")
        )
})



const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
// 1) checking validation
// 2) check if playlist is exist or not
// 3) check ownership
// 4) 

if(!isValidObjectId(playlistId) && !isValidObjectId(videoId)){
    throw new ApiError(401, "None of there Id's are valid")
}

const playlist = await Playlist.findById(playlistId)
    
if(!playlist){
    throw new ApiError(404, " Playlist is not found ")
}

if(playlist.owner.tostring() !== playlist,req.user?._id.tostring() ){
    throw new ApiError(404, "You are not a owner of this playlist so you cannot upload video")
}

const video = await Video.aggregate([
    {
        $match: {
            _id: new mongoose.Types.ObjectId(videoId),

        }
    },
    {
        $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
            pipeline: [
                {
                    $project: {
                        _id: 1,
                        username: 1,
                        avatar: 1
                    }
                }
            ]
        }
    },
    {
        $project: {
            _id: 1,
            videoFile: 1,
            thumbnail: 1,
            title: 1,
            duration: 1,
            views: 1,
            createdAt: 1,
            owner: 1
        }
    }
]);

if(!video || video.length() == 0){
    throw new ApiError(501, "No such a video found")
}
playlist.videos.push(video[0]);

    await playlist.save({ validateBeforeSave: false });

    res.status(200).json(
        new ApiResponse(200, playlist, "Video added successfully")
    );
});


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!isValidObjectId(playlistId) && !isValidObjectId(videoId)){
        throw new ApiError(401, "playlist and videos id's is not Valid" )
    }

    const playlist = await Playlist.findById(playlistId)
    
    if(!playlist.video.find((obj) => obj._id.tostring() !== videoId)){
        throw new ApiError(401, "Video doesno existed in your playlist"  )
    }
    if(!playlist){
        throw new ApiError(401, "playlist is not find")
    }
    
    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(401, "you cannot access the playlist as you are not the fucking owner")
    }

    playlist.videos = playlist.videos.filter((obj) => obj._id.toString() !== videoId)

    await playlist.save({ validateBeforeSave: false });

    res.status(200).json(
        new ApiResponse(200, playlist, "Video removed successfully")
    );

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!isValidObjectId(playlistId)){
        throw new ApiError(401, "Playlist is not valid")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(501, "Playlist not found")
    }

    if(playlist.owner.tostring() !== req.user?._id.tostring()){
        throw new ApiError(401, "As you are not a owner of this playlist so you cannot delete this playlist")
    }

    const deletedplaylist = await Playlist.findByIdAndDelete(playlist)


    if(!deletedplaylist){
        throw new ApiError(501, "Something went wrong while deleting playlist")
    }

    res.status(200)
    .json(
        new ApiResponse(200, "Playlist deleted successfully!!")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;
    const {name, description} = req.body
    //TODO: update playlist

    if(!isValidObjectId(playlistId) && !isValidObjectId(videoId)){
          throw new ApiError(401, "playlist and videos id's is not Valid" )
    }

    if(!name && !description){
        throw new ApiError(401, "Name and description is reuired")
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(401, "you cannot update the playlist as you are not the fucking owner")
    }   
    
    
    const updatedplaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name : name,
                description : description
            }
        },
        {new: true}       //option ensures that the method returns the updated user document rather than the original one.
    )

    if(!updatedplaylist){
        throw new ApiError(401, "Something went wrong while updating the playlist")
    }


    res.status(200)
       .json(
        new ApiResponse(200, "Playlist Updated successfully")
       )

})


export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}