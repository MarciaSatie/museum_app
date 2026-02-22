import { v4 } from "uuid";
import { User } from "./user.js";

export const userMongoStore = {
  async getAllUsers() {
    const users = await User.find({});
    return users.map((user) => {
      const obj = user.toObject();
      return { ...obj, _id: String(obj._id) };
    });
  },

  async addUser(user) {
    const userId = user._id || v4();
    const newUser = new User({
      _id: userId, // Preserve original ID for compatibility
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      role: user.role || "user",
    });
    await newUser.save();
    const obj = newUser.toObject();
    return { ...obj, _id: String(obj._id) };
  },

  async getUserById(id) {
    try {
      const user = await User.findById(id);
      if (!user) {
        return null;
      }
      const obj = user.toObject();
      return { ...obj, _id: String(obj._id) };
    } catch (error) {
      return null;
    }
  },

  async getUserByEmail(email) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return null;
      }
      const obj = user.toObject();
      return { ...obj, _id: String(obj._id) };
    } catch (error) {
      return null;
    }
  },

  async updateUser(user) {
    try {
      const updated = await User.findByIdAndUpdate(user._id, user, { new: true });
      if (!updated) {
        return null;
      }
      const obj = updated.toObject();
      return { ...obj, _id: String(obj._id) };
    } catch (error) {
      return null;
    }
  },

  async deleteUserById(id) {
    try {
      await User.findByIdAndDelete(id);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  },

  async deleteAll() {
    try {
      await User.deleteMany({});
    } catch (error) {
      console.error("Error deleting all users:", error);
    }
  },
};
