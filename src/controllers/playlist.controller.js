import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    const userId = req.user.id; // Assuming the user ID is stored in the JWT and available in req.user

    if (!name || !description) {
        throw new ApiError(400, "Name and description are required for creating a playlist");
    }

    // Create a new playlist
    const playlist = new Playlist({
        name,
        description,
        user: userId,
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
    //     throw new ApiError(500, "Something went wrong while registering the user");
    // }


    // return res.status(201).json(
    //     new ApiResponse(200, createdUser, "Playlist created Successfully")
    // );

    //TODO: create playlist


const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
})


const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
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