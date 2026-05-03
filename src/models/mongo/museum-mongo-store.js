import { v4 } from "uuid";
import { Museum } from "./museum.js";
import { Exhibition } from "./exhibition.js";

const normalizeMuseum = (museum) => {
  if (museum && museum._id) {
    return { ...museum, _id: String(museum._id) };
  }
  return museum;
};

export const museumMongoStore = {
  async getAllMuseums() {
    const museums = await Museum.find().lean();
    return museums.map(normalizeMuseum);
  },

  async addMuseum(museum) {
    museum._id = museum._id || v4();
    const createdMuseum = await new Museum(museum).save();
    return normalizeMuseum(createdMuseum.toObject());
  },

  async getMuseumById(id) {
    try {
      const museum = await Museum.findOne({ _id: id }).lean();
      if (!museum) return null;
      museum.exhibitions = await this.getExhibitionsByMuseumId(museum._id);
      return normalizeMuseum(museum);
    } catch (error) {
      return null;
    }
  },

  async getUserMuseums(userid) {
    const museums = await Museum.find({ userid }).lean();
    return museums.map(normalizeMuseum);
  },

  async deleteMuseumById(id) {
    const museum = await Museum.findOne({ _id: id }).lean();
    if (museum) {
      await Exhibition.deleteMany({ museumid: museum._id });
      await Museum.deleteOne({ _id: id });
    }
  },

  async deleteAllMuseums() {
    await Exhibition.deleteMany({});
    await Museum.deleteMany({});
  },

  async updateMuseum(updatedMuseum) {
    return this.updateMuseumById(updatedMuseum._id, updatedMuseum);
  },

  async updateMuseumById(id, updatedData) {
    try {
      const updatedMuseum = await Museum.findByIdAndUpdate(id, updatedData, { returnDocument: "after" }).lean();
      return normalizeMuseum(updatedMuseum);
    } catch (error) {
      return null;
    }
  },

  async getExhibitionsByMuseumId(id) {
    if (!id) {
      const exhibitions = await Exhibition.find().lean();
      return exhibitions.map((exhibition) => ({ ...exhibition, _id: String(exhibition._id) }));
    }

    const exhibitions = await Exhibition.find({ museumid: id }).lean();
    return exhibitions.map((exhibition) => ({ ...exhibition, _id: String(exhibition._id) }));
  },
};