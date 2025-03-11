import User from "../models/userScheme.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export const signUp = async (req, res) => {
    try {

        const {name,email,password} = req.body;

        const user = await User.findOne({email})

        if(user){
            res.status(400).json({
                success:false,
                message:"User already exists",
            })
        }

        const hashedPassword = await bcrypt.hash(password,10);


        const newUser = await User.create({
            name,
            email,
            password:hashedPassword,
        })

        const token = jwt.sign({userId:newUser._id},process.env.JWT_SECRET,{expiresIn:"1d"});

        res.status(201).json({
            success:true,
            message:"User created successfully",
            user:newUser,
            token,
        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

export const signIn = async (req,res) => {
    try {

        const {email,password} = req.body;

        const user = await User.findOne({email});

        if(!user){
            res.status(400).json({
                success:false,
                message:"User not found",
            })
        }

        const isPasswordValid = await bcrypt.compare(password,user.password);

        if(!isPasswordValid){
            res.status(400).json({
                success:false,
                message:"Invalid password",
            })
        }

        const token = jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:"1d"});

        res.status(200).json({
            success:true,
            message:"User logged in successfully",
            user,
            token,
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}
