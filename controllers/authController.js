import User from "../models/userModel.js";
import bcrypt from 'bcryptjs'
import { otpValidationSchema, signinSchema, signupSchema } from "../validations/validation.js";
import { generateOTP } from "../utils/otp.js";
import transport from "../middleware/sendMail.js";
import jwt from 'jsonwebtoken'


//signup function(User registration)

export const signup = async(req,res) => {
    const {firstName,lastName,email,phone,password}= req.body;
    try{
        const {error} = signupSchema.validate(req.body);
        if(error) {
            return res.status(400).json({message:error.details[0].message})
        }

        const existingUser = await User.findOne({ email })

        if(existingUser){
            return res.status(401).json({message:'Email already exists'})
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = new User({
            firstName,lastName,email,phone,password:hashedPassword
        })

        await newUser.save();

        const otp = generateOTP();
        newUser.verificationCode = otp;


       await transport.sendMail({
            from:process.env.OTP_SENDING_EMAIL,
            to:newUser.email,
            subject:'Verification code',
            html:`<h1>Verification Code ${otp}</h1>`
        })
        await newUser.save();
        res.status(201).json({message: "Signup completed, Verify the otp",newUser});
    }catch(err) {
        console.log(err)
    }
}


//otp validation function(User registration successfully verifies after the otp is verified succesfully)

export const verifyOtp = async(req,res) => {
    const {otp} = req.body;
    try {
        const {error} = otpValidationSchema.validate(req.body);
        if(error) {
            return res.status(400).json({message:error.details[0].message})
        }
        const user = await User.findOne({verificationCode:otp});

        if(!user) {
            return res.status(404).json({message:'Invalid otp'})
        }

        user.verified = true;
        user.verificationCode = undefined;
        await user.save();
        res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        console.log(error)
    }
}


//signin function(User Login using email and password)

export const signin = async(req,res) => {
    const {email,password}  = req.body;
    try {
        const {error} = signinSchema.validate(req.body)
        if(error) {
            return res.status(401).json({message:'Invalid credentials'})        
        }
    const user = await User.findOne({email}).select('+password');

    if(!user) {
        return res.status(404).json({message:'User not found'})
    }
    const isPasswordValid = await bcrypt.compare(password,user.password);
    if(!isPasswordValid){
        return res.status(401).json({message:'Invalid password'})
    }

    //jwt creation
    const token = jwt.sign(
        {
            userId:user._id,
        },
        process.env.JWT_SECRET,
        {
            expiresIn:'4h'
        }
    )

    //storing jwt in cookie storage and it expires in 4hr
    res.cookie('Authorization',token,{
        httpOnly:true,
        secure: process.env.NODE_ENV === 'production', // Only send the cookie over HTTPS in production
        maxAge: 4 * 60 * 60 * 1000,
        sameSite: 'Strict', // Restricts the cookie to same-site requests (prevents CSRF attacks)
    })
        res.status(200).json({message:'User loggedin succesfully'})
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
}

export default {signup,verifyOtp,signin}