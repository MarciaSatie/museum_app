import { v4 } from "uuid";
import { ExhibitionModel, type ExhibitionType } from "./exhibition";

const normalizeExhibition = (exhibition: any): ExhibitionType | null => {
  if (exhibition && exhibition._id) {
    return { ...exhibition, _id: String(exhibition._id) };
  }
  return exhibition;
};

export const exhibitionMongoStore = {

  async getAllExhibitions(): Promise<ExhibitionType[]> {
    const exhibitions = await ExhibitionModel.find().lean();
    return exhibitions.map((e) => normalizeExhibition(e) as ExhibitionType);
  },

  async addExhibition(museumId: string, exhibition: ExhibitionType): Promise<ExhibitionType | null> {
    const data = { ...exhibition, _id: exhibition._id || v4(), museumid: museumId };
    const createdExhibition = await new ExhibitionModel(data).save();
    return normalizeExhibition(createdExhibition.toObject());
  },

  async getExhibitionsByMuseumId(id: string): Promise<ExhibitionType[]> {
    if (!id) {
      return this.getAllExhibitions();
    }
    const exhibitions = await ExhibitionModel.find({ museumid: id }).lean();
    return exhibitions.map((e) => normalizeExhibition(e) as ExhibitionType);
  },

  async getExhibitionById(id: string): Promise<ExhibitionType | null> {
    try {
      if (!id) return null;
      const exhibition = await ExhibitionModel.findOne({ _id: id }).lean();
      return normalizeExhibition(exhibition);
    } catch (error) {
      return null;
    }
  },

  async deleteExhibition(id: string): Promise<void> {
    try {
      await ExhibitionModel.deleteOne({ _id: id });
    } catch (error) {
      console.log("Error deleting exhibition");
    }
  },

  async deleteExhibitionsByMuseumId(museumId: string): Promise<void> {
    await ExhibitionModel.deleteMany({ museumid: museumId });
  },

  async deleteAllExhibitions(): Promise<void> {
    await ExhibitionModel.deleteMany({});
  },

  async updateExhibition(exhibition: ExhibitionType): Promise<ExhibitionType | null> {
    try {
      const updated = await ExhibitionModel.findByIdAndUpdate(exhibition._id, exhibition, { 
        returnDocument: "after" 
      }).lean();
      return normalizeExhibition(updated);
    } catch (error) {
      return null;
    }
  },
};
