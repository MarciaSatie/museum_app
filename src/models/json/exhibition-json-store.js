import { v4 } from "uuid";
import { db } from "./store-utils.js";

export const exhibitionJsonStore = {
  async getAllExhibitions() {
    await db.read();
    return db.data.exhibitions;
  },

  async addExhibition(museumId, exhibition) {
    await db.read();
    exhibition._id = v4();
    exhibition.museumid = museumId;
    db.data.exhibitions.push(exhibition);
    await db.write();
    return exhibition;
  },

  async getExhibitionsByMuseumId(id) {
    await db.read();
    return db.data.exhibitions.filter((exhibition) => exhibition.museumid === id);
  },

  async getExhibitionById(id) {
    await db.read();
    return db.data.exhibitions.find((exhibition) => exhibition._id === id);
  },

  async deleteExhibition(id) {
    await db.read();
    const index = db.data.exhibitions.findIndex((exhibition) => exhibition._id === id);
    db.data.exhibitions.splice(index, 1);
    await db.write();
  },

  async deleteAll() {
    db.data.exhibitions = [];
    await db.write();
  },

  async deleteAllExhibitions() {
    db.data.exhibitions = [];
    await db.write();
  },

  async updateExhibition(exhibition) {
    await db.read();
    const index = db.data.exhibitions.findIndex((e) => e._id === exhibition._id);
    if (index !== -1) {
      db.data.exhibitions[index] = exhibition;
      await db.write();
    }
    return exhibition;
  },
};
