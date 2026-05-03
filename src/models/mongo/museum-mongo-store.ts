import { v4 } from "uuid";
// 1. Import types directly from the model files
import { MuseumModel, type MuseumType } from "./museum";
import { ExhibitionModel, type ExhibitionType } from "./exhibition";

// Helper to cast Mongo _id to string
const normalize = (item: any): any => {
  if (item && item._id) {
    return { ...item, _id: String(item._id) };
  }
  return item;
};


export const museumMongoStore = {
  // 2. Use the correct type names: MuseumType and ExhibitionType
  async getAllMuseums(): Promise<MuseumType[]> {
    const museums = await MuseumModel.find().lean();
    return museums.map((m) => normalize(m) as MuseumType);
  },

  async addMuseum(museum: MuseumType): Promise<MuseumType | null> {
    const data = { ...museum, _id: museum._id || v4() };
    const newMuseum = new MuseumModel(data);
    const museumObj = await newMuseum.save();
    return normalize(museumObj.toObject()) as MuseumType;
  },

  async getMuseumById(id: string): Promise<MuseumType | null> {
    try {
      if (!id) return null;
      const museum = await MuseumModel.findOne({ _id: id }).lean();
      if (!museum) return null;
      
      const exhibitions = await this.getExhibitionsByMuseumId(String(museum._id));
      // Note: If MuseumType doesn't have an 'exhibitions' field in the schema, 
      // TS might complain here. You can use 'as any' or update the MuseumType.
      return normalize({ ...museum, exhibitions }) as any; 
    } catch (error) {
      return null;
    }
  },

  async getUserMuseums(userid: string): Promise<MuseumType[]> {
    const museums = await MuseumModel.find({ userid }).lean();
    return museums.map((m) => normalize(m) as MuseumType);
  },

  async deleteMuseumById(id: string): Promise<void> {
    try {
      const museum = await MuseumModel.findOne({ _id: id }).lean();
      if (museum) {
        await ExhibitionModel.deleteMany({ museumid: museum._id });
        await MuseumModel.deleteOne({ _id: id });
      }
    } catch (error) {
      console.log("Error deleting museum");
    }
  },

  async deleteAllMuseums(): Promise<void> {
    await ExhibitionModel.deleteMany({});
    await MuseumModel.deleteMany({});
  },

  async updateMuseum(updatedMuseum: MuseumType): Promise<MuseumType | null> {
    // added check to ensure _id exists
    return this.updateMuseumById(updatedMuseum._id!, updatedMuseum);
  },

  async updateMuseumById(id: string, updatedData: Partial<MuseumType>): Promise<MuseumType | null> {
    try {
      const updated = await MuseumModel.findByIdAndUpdate(id, updatedData, { returnDocument: "after" }).lean();
      return normalize(updated) as MuseumType | null;
    } catch (error) {
      return null;
    }
  },

  async getExhibitionsByMuseumId(id: string): Promise<ExhibitionType[]> {
    const query = id ? { museumid: id } : {};
    const exhibitions = await ExhibitionModel.find(query).lean();
    return exhibitions.map((e) => normalize(e) as ExhibitionType);
  },
};
