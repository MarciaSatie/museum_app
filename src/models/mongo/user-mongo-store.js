import Mongoose from "mongoose";
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
    const newUser = new User(user);
    const userObj = await newUser.save();
    const u = await this.getUserById(userObj._id);
    return u;
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
