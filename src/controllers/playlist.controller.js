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
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
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