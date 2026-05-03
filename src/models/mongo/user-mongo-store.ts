import { v4 } from "uuid";
// Note: We import the Model as 'UserModel' to avoid name collision with the 'UserType' type
import { UserModel, type UserType} from "./user"; 

// Helper function to ensure _id is treated as a string
// 'any' is used here because Mongoose objects can be messy before normalization
const normalizeUser = (user: any): UserType | null => {
  if (user && user._id) {
    return { ...user, _id: String(user._id) };
  }
  return user;
};

export const userMongoStore = {
  async getAllUserTypes(): Promise<UserType[]> {
    const users = await UserModel.find().lean();
    return users.map((u) => normalizeUser(u) as UserType);
  },

  // async getUserByEmail(email: string): Promise<UserType | null> { // was getUserTypeByEmail
  //   const user = await UserModel.findOne({ email: email }).lean();
  //   return normalizeUser(user);
  // },

  async getUserById(id: string): Promise<UserType | null> {
    try {
      if (!id) return null;
      const user = await UserModel.findOne({ _id: id }).lean();
      return normalizeUser(user);
    } catch (error) {
      return null;
    }
  },

  async addUser(user: UserType): Promise<UserType | null> {
    console.log("💾 Adding user to MongoDB:", user.email);
    try {
      // Ensure _id is present (matching your UUID logic)
      const userData = { ...user, _id: user._id || v4() };
      const newUser = new UserModel(userData);
      const userObj = await newUser.save();
      
      console.log("✅ User saved to MongoDB with _id:", userObj._id);
      return await this.getUserById(String(userObj._id));
    } catch (error: any) {
      console.error("❌ Error adding user:", error.message);
      throw error;
    }
  },

  async getUserByEmail(email: string): Promise<UserType | null> {
    const user = await UserModel.findOne({ email: email }).lean();
    return normalizeUser(user);
  },

  async updateUser(user: UserType): Promise<UserType | null> {
    try {
      const updated = await UserModel.findByIdAndUpdate(user._id, user, { 
        returnDocument: "after" 
      }).lean();
      return normalizeUser(updated);
    } catch (error) {
      return null;
    }
  },

  async deleteUserById(id: string): Promise<void> {
    try {
      await UserModel.deleteOne({ _id: id });
    } catch (error) {
      console.log("bad id");
    }
  },

  async deleteAll(): Promise<void> {
    await UserModel.deleteMany({});
  },
};
