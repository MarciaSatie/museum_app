import { v4 } from "uuid";
import { db } from "./store-utils.js";
import { exhibitionJsonStore } from "./exhibition-json-store.js";

export const museumJsonStore = {
  async getAllMuseums() {
    await db.read();
    return db.data.museums;
  },

  async addMuseum(museum) {
    await db.read();
    museum._id = v4();
    db.data.museums.push(museum);
    await db.write();
    return museum;
  },

  async getMuseumById(id) {
    await db.read();
    const museum = db.data.museums.find((p) => p._id === id);
    if (museum) {
      museum.exhibitions = await exhibitionJsonStore.getExhibitionsByMuseumId(museum._id);
    }
    return museum;
  },

  async getUserMuseums(userid) {
    await db.read();
    return db.data.museums.filter((m) => m.userid === userid);
  },

  async deleteMuseumById(id) {
    await db.read();
    const index = db.data.museums.findIndex((m) => m._id === id);
    db.data.museums.splice(index, 1);
    await db.write();
  },

  async deleteAllMuseums() {
    db.data.museums = [];
    await db.write();
  },

  async updateMuseum(updatedMuseum) {
    await db.read();
    const index = db.data.museums.findIndex((m) => m._id === updatedMuseum._id);
    if (index !== -1) {
      db.data.museums[index] = updatedMuseum;
      await db.write();
    }
    return updatedMuseum;
  },





};
