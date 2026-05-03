import { v4 } from "uuid";
import { Exhibition } from "./exhibition.js";

const normalizeExhibition = (exhibition) => {
  if (exhibition && exhibition._id) {
    return { ...exhibition, _id: String(exhibition._id) };
  }
  return exhibition;
};

export const exhibitionMongoStore = {
  async getAllExhibitions() {
    const exhibitions = await Exhibition.find().lean();
    return exhibitions.map(normalizeExhibition);
  },

  async addExhibition(museumId, exhibition) {
    exhibition._id = exhibition._id || v4();
    exhibition.museumid = museumId;
    const createdExhibition = await new Exhibition(exhibition).save();
    return normalizeExhibition(createdExhibition.toObject());
  },

  async getExhibitionsByMuseumId(id) {
    if (!id) {
      return this.getAllExhibitions();
    }

    const exhibitions = await Exhibition.find({ museumid: id }).lean();
    return exhibitions.map(normalizeExhibition);
  },

  async getExhibitionById(id) {
    try {
      const exhibition = await Exhibition.findOne({ _id: id }).lean();
      return normalizeExhibition(exhibition);
    } catch (error) {
      return null;
    }
  },

  async deleteExhibition(id) {
    await Exhibition.deleteOne({ _id: id });
  },

  async deleteExhibitionsByMuseumId(museumId) {
    await Exhibition.deleteMany({ museumid: museumId });
  },

  async deleteAllExhibitions() {
    await Exhibition.deleteMany({});
  },

  async updateExhibition(exhibition) {
    try {
      const updated = await Exhibition.findByIdAndUpdate(exhibition._id, exhibition, { returnDocument: "after" }).lean();
      return normalizeExhibition(updated);
    } catch (error) {
      return null;
    }
  },
};