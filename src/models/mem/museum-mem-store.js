import { v4 } from "uuid";
import { exhibitionMemStore } from "./exhibition-mem-store.js";

let museums = [];

export const museumMemStore = {
  async getAllMuseums() {
    return museums;
  },

  async addMuseum(museum) {
    museum._id = v4();
    museums.push(museum);
    return museum;
  },

  async getMuseumById(id) {
    const museum = museums.find((m) => m._id === id);
    museum.exhibitions = await exhibitionMemStore.getExhibitionsByMuseumId(museum._id);
    return museum;
  },

  async getUserMuseums(userid) {
    return museums.filter((m) => m.userid === userid);
  },

  async deleteMuseumById(id) {
    const index = museums.findIndex((m) => m._id === id);
    museums.splice(index, 1);
  },

  async deleteAllMuseums() {
    museums = [];
  },
};
