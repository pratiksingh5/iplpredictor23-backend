import mongoose from "mongoose";
const userIds = [
  new mongoose.Types.ObjectId(),
];

export const users = [
  {
    _id: userIds[0],
    firstName: "TheHumor",
    lastName: "Bro",
    email: "pratikrajaryan@gmail.com",
    password: "12345",
    picturePath: "p11.jpeg",
    friends: [],
    location: "Dhanbad",
    occupation: "Instagram chalana",
    votes: [],
    role : "admin",
    viewedProfile: 14561,
    impressions: 888822,
    createdAt: 1115211422,
    updatedAt: 1115211422,
    __v: 0,
  }
];