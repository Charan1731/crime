import express from "express";
import dotenv from "dotenv";
import connectDB from "./database/connectDb.js";
import authRouter from "./routes/authRouter.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use('/api/v1/auth', authRouter);

app.listen(process.env.PORT,  async () => {
    console.log(`Server is running on port ${process.env.PORT}`);
    await connectDB();
});