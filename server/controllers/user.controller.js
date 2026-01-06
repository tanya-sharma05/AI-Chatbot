import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import bcrypt from "bcryptjs";
import { Chat } from "../models/chat.models.js";

const generateToken= (id)=>{
    return jwt.sign({id}, process.env.JWT_SECRET_KEY,{
        expiresIn: '30d' 
    })
};

export const registerUser= async(req,res)=>{
    const {name, email, password}= req.body;

    try{
        const userExists= await User.findOne({email});
        if(userExists){
            return res.json({success: false, message: 'User already exists'});
        }

        const user= await User.create({name, email, password});

        const token= generateToken(user._id);
        return res.json({success: true, token});
    } 
    catch(error){
        return res.json({success: false, message: error.message});
    }
};

export const loginUser= async(req,res)=>{
    const {email, password}= req.body;

    try{
        const userExists= await User.findOne({email});
        if(userExists){
            const isMatch= await bcrypt.compare(password, userExists.password);
            if(isMatch){
                const token= generateToken(userExists._id);
                return res.json({success: true, token});
            }
        }
        return res.json({success: false, message: 'Invalid user credentials'});        
    } 
    catch(error){
        return res.json({success: false, message: error.message});
    }
};

export const getUser= async(req,res)=>{
    try{
        const user= req.user;
        return res.json({success: true, user});
    } 
    catch(error){
        return res.json({success: false, message: error.message});
    }
};

export const getPublishedImages= async(req,res)=>{
    try{
        const publishedImageMessages= await Chat.aggregate([
            {$unwind: "$messages"},
            {
                $match:{
                    "messages.isImage": true,
                    "messages.isPublished": true
                }
            },
            {
                $project:{
                    _id: 0,
                    imageUrl: "$messages.content",
                    userName: "$userName"
                }
            }
        ])
        res.json({success: true, images: publishedImageMessages.reverse()});
    } 
    catch(error){
        return res.json({success: false, message: error.message});
    }
};
