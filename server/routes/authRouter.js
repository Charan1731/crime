import { Router } from "express";
import { signIn, signUp } from "../controllers/authController.js";
import verifyToken from "../middlewares/authMiddleware.js";

const authRouter = Router();

authRouter.post("/sign-in", signIn);
authRouter.post("/sign-up", signUp);

authRouter.get("/protected", verifyToken, (req, res) => {
    res.status(200).json({
        success:true,
        message:"Protected route",
    })
})

authRouter.get("/me", verifyToken, (req, res) => {
    res.status(200).json({
        success:true,
        message:"Me route",
    })
})
export default authRouter;