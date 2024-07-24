import mongoose, {Schema} from "mongoose";
import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username : {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email : {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName : {
            type: String,
            required: true,
            trim: true,
            index: true
        },

        avatar : {
            type: String,   //cloudinary
            required: true
        },
        coverImage : {
            type: String,
           
        },
        watchHistory: [{
            type : Schema.Types.ObjectId,
            ref : "Video"
        }],
        password: {
            type : String,
            required : [true, "PASSWORD IS MUST"]
        },
        refreshToken: {
            type : String
        }
        
    },
    {
        timestamps : true
    }
    )


userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next(); //thi =s is line only for not chaing passowrd again and agian
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function
(password) {
   return  await bcrypt.compare(password, this.passowrd)
}


userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id : this._id,
            email :this.email,
            username :this.username,
            fullname :this.fullName
        },
        process.enc.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}   
userSchema.methods.generateRefreshToken = function() {
return jwt.sign(
    {
        _id : this._id,
      
    },
    process.enc.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
)
}

 
export const User = mongoose.model("User", userSchema)

