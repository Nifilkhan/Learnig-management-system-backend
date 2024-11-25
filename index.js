import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import connectDb from './config/db.js';
import dotenv from 'dotenv'
import authRoutes from '../LMS_Backend/routes/authRoutes.js'

const app = express();

dotenv.config();

const port = process.env.PORT || 6002

app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use('/api/auth',authRoutes)

connectDb();

app.get('/' , (req,res) => {
    res.json({message:'Welcome to the server'})
})

app.listen(port,()=> {
    console.log(`http://localhost:${port}`)
})