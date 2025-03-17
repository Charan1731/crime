import jwt from "jsonwebtoken";
import User from "../models/userScheme.js";

const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];

    if(!token){
        res.status(401).json({
            success:false,
            message:"Unauthorized",
        })
    }
    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId);

        if(!user){
            res.status(401).json({
                success:false,
                message:"Unauthorized",
            })
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

export default verifyToken;