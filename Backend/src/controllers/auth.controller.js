import { generateToken } from "../lib/utils.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js"


export const signup = async(req,res)=>{

    const {fullName,email,password} = req.body

    try{
        if(!fullName || !email || !password){
            return res.status(400).json({message: "All fields are required."})
        }
        if(password.length < 6){
            return res.status(400).json({message: "Password must be atleast 6 characters long."})
        }
        const user = await User.findOne({email})

        if (user) return res.status(400).json({message: "Email already exists."})

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        })

        if(newUser){
            //generate jwt token here
            generateToken(newUser._id,res)
            await newUser.save(); //saves new user to db

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic
            })
        }
        else{
            return res.status(400).json({message: "Invalid user data."})
        }

    } catch(error){
        console.log("Error in signup controller",error)
        res.status(400).json({message: "Internal Server Error."})
    }
}

export const login = async (req,res)=>{
    console.log("req.body received:", req.body);
    const {email,password} = req.body
    try{
        //chks if user already exists
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message: "Invalid credentials."})
        }
        //compares user's raw password with encrypted db password
       const isPasswordCorrect =  await bcrypt.compare(password, user.password)
       if(!isPasswordCorrect){
        return res.status(400).json({message: "Invalid credentials."})
       }
       generateToken(user._id,res)
       res.status(200).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic
       })
    }catch(error){
        console.log("Error in login controller",error)
        res.status(500).json({message: "Internal Server Error."})
    }
}

export const logout = (req,res)=>{
    try{
        res.cookie("jwt","",{maxAge:0}) //clear cookies
        res.status(200).json({message: "Logged out successfully."})
    }catch(error){
        console.log("Error in logout controller",error)
        res.status(500).json({message: "Internal Server Error."})
    }
}

export const updateProfile = async (req,res)=>{
    try{
        const {profilePic} = req.body;
        const userId = req.user._id;

        if(!profilePic){
        res.status(400).json({message: "Profile pic is required."})
        }

        //cloudinary is just a  ucket for our images

        const uploadResponse = await cloudinary.uploader.upload(profilePic)

        //update user prof pic in db
        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic: uploadResponse.secure_url},{new:true})

        res.status(200).json({updatedUser})

    }catch(error){
        console.log("Error in update profile controller",error)
        res.status(500).json({message: "Internal Server Error."})
    }
}

export const checkAuth = (req,res)=>{
    try{
        //send user back to the client
        res.status(200).json(req.user)
    }catch(error){
        console.log("Error in checkAuth controller",error)
        res.status(500).json({message: "Internal Server Error."})
    }
}