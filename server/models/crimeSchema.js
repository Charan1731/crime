import mongoose from "mongoose";

const crimeSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    location:{
        type:String,
        required:true,
    },
    date:{
        type:Date,
        required:true,
    },
    suspect:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        enum:["pending","solved"],
        default:"pending",
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
    uplodedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    images:[{
        type:String,
    }],
    video:{
        type:String,
    },
    
},{timestamps:true})

const Crime = mongoose.model("Crime",crimeSchema);

export default Crime;