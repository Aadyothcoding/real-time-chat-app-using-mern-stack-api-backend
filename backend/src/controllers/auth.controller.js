import { generateToken } from '../lib/utils.js';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import cloudinary from '../lib/cloudinary.js';  

export const signup = async (req,res)=>{
    const{ email, fullName, password,  } = req.body;
    try{
        if(password.length < 6){
            return res.status(400).send('Password must be at least 6 characters long');
        }
        if(!email || !fullName || !password){
            return res.status(400).send('Please fill all the fields');
        }
        const user = await User.findOne({email})
        if(user){
            return res.status(400).send('User already exists with this email');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser= new User({
            email,
            fullName,
            password: hashedPassword,
        });
        if (newUser){
            generateToken(newUser._id, res);
            await newUser.save();
            return res.status(201).json({
                _id: newUser._id,
                email: newUser.email,
                fullName: newUser.fullName,
                profilePic: newUser.profilePic
            });
        }else{
            return res.status(400).send('User creation failed');
        }

    }catch(error){
        console.error('Error during signup:', error);
        res.status(500).send('Internal Server Error');
    }
};

export const login = async (req, res) => {
    try{
        const { email, password } = req.body;
        const user = await User.findOne({ email})

        if (!user) {
            return res.status(400).send('User does not exist with this email');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send('Invalid credentials');
        }
        generateToken(user._id, res);
        res.status(200).json({
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            profilePic: user.profilePic
        });

    }catch(error){
        console.error('Error during login:', error);
        res.status(500).send('Internal Server Error');
    }
};

export const logout = (req, res) => {
    try{
        res.cookie("jwt","",{maxAge:0})
        res.status(200).send('Logged out successfully');
    }catch(error){
        console.error('Error during logout:', error);
        res.status(500).send('Internal Server Error');
    }
}

export const updateProfile = async (req, res) => {
    try{
        const{profilePic} = req.body;
        const userId = req.user._id;
        if(!profilePic){
            return res.status(400).send('Please provide a profile picture');
        
        }
        const uploadResponse= await cloudinary.uploader.upload(profilePic)
        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic: uploadResponse.secure_url}, {new: true});
        res.status(200).json(updatedUser);
        if(!updatedUser){
            return res.status(404).send('User not found');
        }

    }catch(error){
        console.error('Error during profile update:', error);
        res.status(500).send('Internal Server Error');
    
}
}

export const checkAuth = (req, res) => {
  try {
    // Directly send selected safe user fields
    const user = req.user;

    res.status(200).json({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log('Error during checkAuth:', error.message);
    res.status(500).send('Internal Server Error');
  }
};


