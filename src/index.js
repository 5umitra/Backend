//require('dotenv').config({'path' : './env'})


import dotenv from "dotenv"
// import mongoose from "mongoose";
// import { DB_NAME } from "./constant";
import connectDB from "./db/index.js";

 


dotenv.config({
    'path' : './env'
})


connectDB()                                                                                
.then( () => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO DB connection failed:", err);
})




















/*
const app = express()


(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI} /${DB_NAME}`)

        app.on("ERROR", (error) => {
            console.log("ERRRO :", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`APP is listeing on PORT ${process.env.PORT}`);
        })
    } catch (error) {
        console.log("ERROR : ", error);
        throw error
    }
})()

*/
