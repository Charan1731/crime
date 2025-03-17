import mongoose from "mongoose";

const crimeSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    location:{
        type: String,
        required: true,
    },
    date:{
        type: Date,
        required: true,
    },
    status:{
        type: String,
        enum: ["pending","solved"],
        default: "pending",
    },
    uplodedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    images:[{
        fileUrl: {
            type: String
        },
        fileType: {
            type: String
        }
    }],
    video:{
        type: String,
    },
    
},{timestamps:true})

const Crime = mongoose.model("Crime",crimeSchema);

export default Crime;