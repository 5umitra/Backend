import mongoose from "mongoose"
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

    
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }



