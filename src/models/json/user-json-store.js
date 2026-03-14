import { v4 } from "uuid";
import { db } from "./store-utils.js";
import { museumJsonStore} from "./museum-json-store.js";
import { exhibitionJsonStore } from "./exhibition-json-store.js";

export const userJsonStore = {
  async getAllUsers() {
    await db.read();
    return db.data.users;
  },

  async addUser(user) {
    await db.read();
    user._id = v4();
    db.data.users.push(user);
    await db.write();
    return user;
  },

  async getUserById(id) {
    await db.read();
    let u = db.data.users.find((user) => user._id === id);
    if (u === undefined) u = null;
    return u;
  },

  async getUserByEmail(email) {
    await db.read();
    let u = db.data.users.find((user) => user.email === email);
    if (u === undefined) u = null;
    return u;
  },

  async deleteUserById(id) {
    await db.read();
    const index = db.data.users.findIndex((user) => user._id === id);
  
    // Get all museums for this user
    const museums = await museumJsonStore.getUserMuseums(id);
  
    // Delete all museums and their exhibitions
    await museumJsonStore.deleteMuseumById(museum._id);
      
    // Delete the user
    if (index !== -1) db.data.users.splice(index, 1);
    await db.write();
  },

  async updateUser(user) {
    await db.read();
    const index = db.data.users.findIndex((u) => u._id === user._id);
    if (index !== -1) {
      db.data.users[index] = user;
      await db.write();
    }
    return user;
  },

  async deleteAll() {
    db.data.users = [];
    await db.write();
  },
};
