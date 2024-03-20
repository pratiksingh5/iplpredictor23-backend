import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import cloudinary from "cloudinary";
import nodemailer from "nodemailer";

// Configuration 
cloudinary.config({
  cloud_name: "vbushoutout",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true  
});

/* REGISTER USER */
export const register = async (req, res) => {
  try {
    const {
      name,
      instaUsername,
      email,
      password,
      picturePath,
    } = req.body;

    cloudinary.config({
      cloud_name: "vbushoutout",
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true  
    });

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    let myUpload;
    try {
      // myUpload = await cloudinary.uploader.upload('public/assets/' + picturePath);
      myUpload = await cloudinary.uploader.upload(path.join('/tmp', picturePath));
    } catch (uploadErr) {

      throw new Error('Error uploading picture: ' + uploadErr);
    }


    const newUser = new User({
      name,
      instaUsername,
      email,
      password: passwordHash,
      picturePath: {
        public_id: myUpload.public_id,
        url: myUpload.secure_url
      },
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

/* LOGGING IN */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) return res.status(400).json({ msg: "User does not exist. " });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    delete user.password;
    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const forgotPassword = async(req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Generate OTP
    const OTP = Math.floor(100000 + Math.random() * 900000);
    
    // Update user document with OTP
    user.OTP = OTP;
    user.OTPExpiration = Date.now() + 600000; // OTP valid for 10 minutes
    await user.save();
    
    // Send OTP to user email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      secure: true,
      auth: {
        // user: 'vbushoutout@gmail.com',
        user: 'thedialoguesaga@gmail.com',
        pass: process.env.VBU_PASSWORD
      }
    });

    const mailOptions = {
      from: 'thehumorbro',
      to: email,
      subject: 'Reset your password for your IPL Predictor 2023',
      text: `Use the following OTP to reset your password: ${OTP}`
    };
    
    await transporter.sendMail(mailOptions);
    
    res.status(200).send({ message: 'OTP sent to email' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}


export const resetPassword = async (req, res) => {
  try {
    const { email, OTP, newPassword } = req.body;
    const user = await User.findOne({ email, OTP });
    
    if (!user) {
      return res.status(400).send({ message: 'Invalid OTP' });
    }
    
    if (user.OTPExpiration < Date.now()) {
      return res.status(400).send({ message: 'OTP Expired' } );
    }
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(newPassword, salt);
    // Update user password with new password
    user.password = passwordHash;
    user.OTP = null;
    user.OTPExpiration = null;
    await user.save();
    
    res.status(200).send({ message: 'Password updated successfully' } );
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}