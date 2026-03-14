import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import { sendWelcomeEmail } from "../emails/emailHandler.js";
import dotenv from "dotenv";

dotenv.config()

//SIGNUP
export const signup = async (req , res) =>{
   const { fullname , email , password } = req.body;

   try {

    if(!fullname || !email || !password){
        return res.status(400).json({ message: 'All fields are required' });
    }

    if(password.length < 6){
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailRegex.test(email)){
        return res.status(400).json({ message: 'Invalid email format' });
    }

    const user = await User.findOne({ email });

    if(user){
        return res.status(400).json({ message: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password , salt);

    const newUser = new User({
        fullname,
        email,
        password: hashedPassword,
    });

    await newUser.save();

    generateToken(newUser._id , res);

    res.status(201).json({
        _id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email,
        profilePic: newUser.profilePic,
    });


    //send welcome email
    try {
        await sendWelcomeEmail(newUser.email, newUser.fullname, process.env.CLIENT_URL);
    } catch (error) {
        console.error("Failed to send welcome email:", error);
        
    }

   } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Server error' });
   }
};

//LOGIN
export const login = async (req , res) =>{
    const { email , password } = req.body;

  try {
      if(!email || !password)
    {
        return res.status(400).json({
            message: "All fields are required" 
        })
    }

    const user = await User.findOne({email}) 
    
        if(!user) return res.status(400).json({message: "Invalid Credentials"})
    

    const isPasswordCorrect = await bcrypt.compare(password , user.password)
    if(!isPasswordCorrect) return res.status(400).json({message : "Invalid Credentials"})

    generateToken(user._id , res)
    res.status(200).json({
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        profilePic: user.profilePic

    })
    
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
    
  }
}

//LOGOUT
export const logout = (req , res) =>{
    res.clearCookie("jwt");
    res.status(200).json({message: "Logged out successfully"})
}