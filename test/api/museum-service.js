import axios from "axios";
import { serviceUrl } from "../fixtures.js";

export const museumService = {
  museumUrl: serviceUrl,

  // Museum endpoints
  async createMuseum(museum) {
    const res = await axios.post(`${this.museumUrl}/api/museums`, museum);
    return res.data;
  },

  async getMuseum(id) {
    const res = await axios.get(`${this.museumUrl}/api/museums/${id}`);
    return res.data;
  },

  async getAllMuseums() {
    const res = await axios.get(`${this.museumUrl}/api/museums`);
    return res.data;
  },

  async updateMuseum(id, museum) {
    const res = await axios.put(`${this.museumUrl}/api/museums/${id}`, museum);
    return res.data;
  },

  async deleteMuseum(id) {
    const res = await axios.delete(`${this.museumUrl}/api/museums/${id}`);
    return res.data;
  },

  // Category endpoints
  async createCategory(category) {
    const res = await axios.post(`${this.museumUrl}/api/categories`, category);
    return res.data;
  },

  async getCategory(id) {
    const res = await axios.get(`${this.museumUrl}/api/categories/${id}`);
    return res.data;
  },

  async getAllCategories() {
    const res = await axios.get(`${this.museumUrl}/api/categories`);
    return res.data;
  },

  async deleteCategory(id) {
    const res = await axios.delete(`${this.museumUrl}/api/categories/${id}`);
    return res.data;
  },

  // Exhibition endpoints
  async createExhibition(museumId, exhibition) {
    const res = await axios.post(`${this.museumUrl}/api/museums/${museumId}/exhibitions`, exhibition);
    return res.data;
  },

  async getExhibition(id) {
    const res = await axios.get(`${this.museumUrl}/api/exhibitions/${id}`);
    return res.data;
  },

  async getAllExhibitions() {
    const res = await axios.get(`${this.museumUrl}/api/exhibitions`);
    return res.data;
  },

  async getExhibitionsByMuseum(museumId) {
    const res = await axios.get(`${this.museumUrl}/api/museums/${museumId}/exhibitions`);
    return res.data;
  },

  async deleteExhibition(id) {
    const res = await axios.delete(`${this.museumUrl}/api/exhibitions/${id}`);
    return res.data;
  },
};
