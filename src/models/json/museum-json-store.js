import { v4 } from "uuid";
import { db } from "./store-utils.js";
import { exhibitionJsonStore } from "./exhibition-json-store.js";

export const museumJsonStore = {
  async getAllMuseums() {
    await db.read();
    return db.data.playlists;
  },

  async addMuseum(museum) {
    await db.read();
    museum._id = v4();
    db.data.playlists.push(museum);
    await db.write();
    return museum;
  },

  async getMuseumById(id) {
    await db.read();
    const museum = db.data.playlists.find((p) => p._id === id);
    if (museum) {
      museum.exhibitions = await exhibitionJsonStore.getExhibitionsByMuseumId(museum._id);
    }
    return museum;
  },

  async getUserMuseums(userid) {
    await db.read();
    return db.data.playlists.filter((m) => m.userid === userid);
  },

  async deleteMuseumById(id) {
    await db.read();
    const index = db.data.playlists.findIndex((m) => m._id === id);
    db.data.playlists.splice(index, 1);
    await db.write();
  },

  async deleteAllMuseums() {
    db.data.playlists = [];
    await db.write();
  },
};
