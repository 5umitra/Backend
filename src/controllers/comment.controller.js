import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate the video ID
    if (!isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid video ID format");
    }

    // Convert pagination parameters to integers
    const currentPage = Number(page);
    const commentsPerPage = Number(limit);
    const offset = (currentPage - 1) * commentsPerPage;
// First Page (pageNum = 1):
// skipCount = (1 - 1) * 10 = 0
// No documents are skipped, so you get the first 10 comments.
// Second Page (pageNum = 2):

// skipCount = (2 - 1) * 10 = 10
// The first 10 comments are skipped, and you get comments 11 to 20.

// Fetch comments with user and like details
    const comments = await Comment.aggregate([
        {
            $match: { video: new mongoose.Types.ObjectId(videoId) }
        },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "author",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            avatar: 1,
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        {
            $addFields: {
                likeCount: { $size: "$likes" }
            }
        },
        {
            $project: {
                _id: 1,
                content: 1,
                createdAt: 1,
                author: 1,
                likeCount: 1
            }
        },
        { $skip: offset },
        { $limit: commentsPerPage }
    ]);

    // Handle case where no comments are found
    if (!comments.length) {
        throw new ApiError(404, "No comments found for this video");
    }

    // Send response with fetched comments
    res.status(200).json(
        new ApiResponse(200, comments, "Successfully retrieved comments")
    );
});


const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { content } = req.body
    const { videoId } = req.params


        if(!isValidObjectId(videoId)){
            throw new ApiError(401, " given user Id is invalid ")
        }
        if(content?.trim() === ""){
            throw new ApiError(401, "Content must be present")
        }

        const comment = await Comment.create({
            content : content,
            video : new mongoose.Types.ObjectId(videoId),
            user : new mongoose.Types.ObjectId(req.user?._id)
        })

        if(!comment){
            throw new ApiError(400, "Something went wrong while creating comment")
        }

        return res
        .status(200)
        .json(200, comment , " Comments created successfully :)")

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { content } = req.body
    const { commentId } = req.params

    if(content.trim() === ""){
        throw new ApiError(401, " Comment can not be empty ")
    }

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, " invalid comment Id " )
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(501, " no such a comments found ")
    }

    if(comment.owner.tostrinG() !== req.user?._id.tostring()){
        throw new ApiError(401, " You can not change the commment cause you are not the fucking owner!! ")
    }


    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content : content.trim()
            }
        },
        {new : true}
    )

    if(!updateComment){
        throw new ApiError(501, " Something went wrong while updating comment ")
    }

    return res
    .status(200)
    .json(200, updatedComment, " Comment updated successfully ")

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params

    if(!isValidObjectId(commentId)){
        throw new ApiError(401, " Not a valid comments Id ")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(501, " NO such a comment found ")
    }

    if(comment.owner.tostring() !== req.user?._id.tostrinhg()){
        throw new ApiError(401, " You can not delete the commemnts here because you are not the fucking owner of this comment!!")
    }

    const deletedcomment = await Comment.findByIdAndDelete(commentId)

    if(!deletedcomment){
        throw new ApiError(401, "Something went wrong while deleting comment")
    }

    return res
    .status(200)
    .json(200, " Comments deleted successfully ")
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }



