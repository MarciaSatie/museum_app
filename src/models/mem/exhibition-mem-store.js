import { v4 } from "uuid";

let exhibitions = [];

export const exhibitionMemStore = {
  async getAllExhibitions() {
    return exhibitions;
  },

  async addExhibition(museumId, exhibition) {
    exhibition._id = v4();
    exhibition.museumid = museumId;
    exhibitions.push(exhibition);
    return exhibition;
  },

  async getExhibitionsByMuseumId(id) {
    return exhibitions.filter((exhibition) => exhibition.museumid === id);
  },

  async getExhibitionById(id) {
    return exhibitions.find((exhibition) => exhibition._id === id);
  },

  async getMuseumExhibitions(museumId) {
    return exhibitions.filter((exhibition) => exhibition.museumid === museumId);
  },

  async deleteExhibition(id) {
    const index = exhibitions.findIndex((exhibition) => exhibition._id === id);
    exhibitions.splice(index, 1);
  },

  async deleteAllExhibitions() {
    exhibitions = [];
  },

  async updateExhibition(exhibition, updatedExhibition) {
    exhibition.title = updatedExhibition.title;
    exhibition.artist = updatedExhibition.artist;
    track.duration = updatedTrack.duration;
  },
};
