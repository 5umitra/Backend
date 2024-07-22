import dotenv from "dotenv"
import connectDB from "./db/index.js";

import {app} from './app.js'
dotenv.config({
    path: './.env'
})
//@@ -11,7 +11,7 @@ dotenv.config({
connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
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
