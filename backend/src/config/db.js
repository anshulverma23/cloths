import mongoose from "mongoose";
import { config } from "./config.js";

const connectDB = async () => {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
        throw new Error("MONGO_URI is not defined in environment variables");
    }

    await mongoose.connect(mongoURI); 
    console.log("MongoDB connected");
}

export default connectDB;