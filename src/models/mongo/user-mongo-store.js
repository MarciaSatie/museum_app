import Mongoose from "mongoose";
import { v4 } from "uuid";
import { User } from "./user.js";

// Helper function to convert ObjectId to string
const normalizeUser = (user) => {
  if (user && user._id) {
    return { ...user, _id: String(user._id) };
  }
  return user;
};

export const userMongoStore = {
  async getAllUsers() {
    const users = await User.find().lean();
    return users.map(normalizeUser);
  },

  async getUserById(id) {
    try {
      const user = await User.findOne({ _id: id }).lean();
      return normalizeUser(user);
    } catch (error) {
      return null;
    }
  },

  async addUser(user) {
    console.log("💾 Adding user to MongoDB:", user.email);
    try {
      user._id = user._id || v4(); // Generate UUID if not provided
      const newUser = new User(user);
      const userObj = await newUser.save();
      console.log("✅ User saved to MongoDB with _id:", userObj._id);
      const u = await this.getUserById(userObj._id);
      return u;
    } catch (error) {
      console.error("❌ Error adding user:", error.message);
      throw error;
    }
  },

  async getUserByEmail(email) {
    const user = await User.findOne({ email: email }).lean();
    return normalizeUser(user);
  },

  async updateUser(user) {
    try {
      const updated = await User.findByIdAndUpdate(user._id, user, { new: true }).lean();
      return normalizeUser(updated);
    } catch (error) {
      return null;
    }
  },

  async deleteUserById(id) {
    try {
      await User.deleteOne({ _id: id });
    } catch (error) {
      console.log("bad id");
    }
  },

  async deleteAll() {
    await User.deleteMany({});
  },
};
