import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import cloudinary from "cloudinary";
import nodemailer from "nodemailer";

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash OTP
const hashOTP = async (OTP) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(OTP, salt);
};

export const register = async (req, res) => {
  try {
    const { email, password, name, instaUsername } = req.body;
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      instaUsername,
      email,
      password: passwordHash,
      picturePath: {
        public_id: "default_img",
        url: "https://res.cloudinary.com/vbushoutout/image/upload/v1711174540/THBM-LOGO2_yt6nlf.jpg",
      },
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

/* REGISTER USER */
// export const register = async (req, res) => {
//   try {
//     const {
//       name,
//       instaUsername,
//       email,
//       password,
//       // picturePath,
//     } = req.body;

//     // cloudinary.config({
//     //   cloud_name: "vbushoutout",
//     //   api_key: process.env.CLOUDINARY_API_KEY,
//     //   api_secret: process.env.CLOUDINARY_API_SECRET,
//     //   secure: true
//     // });

//     const salt = await bcrypt.genSalt();
//     const passwordHash = await bcrypt.hash(password, salt);

//     // let tempraryImageDirectory = '/tmp/';
//     // const usersPath = path.join(process.cwd(), tempraryImageDirectory, picturePath);
//     // console.log(usersPath)

//     // let myUpload;
//     // try {
//     //   myUpload = await cloudinary.uploader.upload('public/assets/' + picturePath);
//     //   // myUpload = await cloudinary.uploader.upload(usersPath);
//     // } catch (uploadErr) {

//     //   throw new Error('Error uploading picture: ' + uploadErr);
//     // }

//     const newUser = new User({
//       name,
//       instaUsername,
//       email,
//       password: passwordHash,
//       picturePath: {
//         public_id: "test",
//         url: "test_url"
//       },
//     });
//     const savedUser = await newUser.save();
//     res.status(201).json(savedUser);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: err.message });
//   }
// };

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

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Generate OTP
    const OTP = generateOTP();
    // const hashedOTP = await hashOTP(OTP); // Hash OTP
    // Hash the OTP
    const hashedOTP = await bcrypt.hash(OTP, 10);

    // Set OTP in cookie
    res.cookie("otpToken", hashedOTP, {
      httpOnly: true,
      secure: true,
      maxAge: 10 * 60 * 1000, // 10 minutes
    });

    // Update user document with OTP
    // user.OTP = OTP;
    // user.OTPExpiration = Date.now() + 600000; // OTP valid for 10 minutes
    // await user.save();

    // Send OTP to user email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      secure: true,
      auth: {
        user: "thedialoguesaga@gmail.com",
        pass: process.env.VBU_PASSWORD,
      },
    });

    const mailOptions = {
      from: "thehumorbro",
      to: email,
      subject: "Reset your password for your IPL Predictor 2023",
      text: `Use the following OTP to reset your password: ${OTP}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).send({ message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, OTP, newPassword } = req.body;
    const hashedOTP = req.cookies.otpToken;

    if (!hashedOTP) {
      return res.status(400).send({ message: "OTP expired or not set" });
    }

    // Verify OTP
    const isMatch = await bcrypt.compare(OTP, hashedOTP);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(newPassword, salt);
    // Update user password with new password
    user.password = passwordHash;
    await user.save();

    // Clear OTP cookie after successful verification
    res.clearCookie("otpToken");

    res.status(200).send({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
