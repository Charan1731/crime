import express from "express";
import dotenv from "dotenv";
import connectDB from "./database/connectDb.js";
import authRouter from "./routes/authRouter.js";
import crimeRouter from "./routes/crimeRoutes.js";
import cors from "cors";
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization']
}));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/crimes', crimeRouter);

app.listen(process.env.PORT,  async () => {
    console.log(`Server is running on port ${process.env.PORT}`);
    await connectDB();
});