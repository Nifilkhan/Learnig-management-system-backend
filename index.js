import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import connectDb from './config/db.js';
import dotenv from 'dotenv'

const app = express();

dotenv.config();

const port = process.env.PORT || 6002

app.use(cors());
app.use(cookieParser());
app.use(express.json())

connectDb();

app.listen(port,()=> {
    console.log(`http://localhost:${port}`)
})