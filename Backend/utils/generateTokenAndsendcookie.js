import jwt from "jsonwebtoken";
import { User } from "../models/User/user.model.js";

export const generateTokenAndsendcookie = async (res, userid) => {
  // Get the full user object
  const UserModel = User();
  const user = await UserModel.findById(userid).select('-password');
  if (!user) {
    throw new Error('User not found');
  }

  // Create token with user data
  const token = jwt.sign(
    { 
      id: user._id,
      email: user.email,
      name: user.name,
      lastname: user.lastname,
      umid: user.umid
    }, 
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  // Return token without setting cookie
  return token;
};
