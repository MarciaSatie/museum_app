import axios from "axios";
import { serviceUrl } from "../fixtures.js";

let authToken = null; // holds JWT token for authenticated API requests in tests.

export const museumService = {
  museumUrl: serviceUrl,

  // Authenticate and get JWT token
  async authenticate(user) {
    const res = await axios.post(`${this.museumUrl}/api/authenticate`, user);
    authToken = res.data.token;
  },

  getAuthHeaders() {
    return { headers: { Authorization: `Bearer ${  authToken}` } };
  },

  // Museum endpoints
  async createMuseum(museum) {
    const res = await axios.post(`${this.museumUrl}/api/museums`, museum, this.getAuthHeaders());
    return res.data;
  },

  async getMuseum(id) {
    const res = await axios.get(`${this.museumUrl}/api/museums/${id}`, this.getAuthHeaders());
    return res.data;
  },

  async getAllMuseums() {
    const res = await axios.get(`${this.museumUrl}/api/museums`, this.getAuthHeaders());
    return res.data;
  },

  async updateMuseum(id, museum) {
    const res = await axios.put(`${this.museumUrl}/api/museums/${id}`, museum, this.getAuthHeaders());
    return res.data;
  },

  async deleteMuseum(id) {
    const res = await axios.delete(`${this.museumUrl}/api/museums/${id}`, this.getAuthHeaders());
    return res.data;
  },

  // Category endpoints
  async createCategory(category) {
    const res = await axios.post(`${this.museumUrl}/api/categories`, category, this.getAuthHeaders());
    return res.data;
  },

  async getCategory(id) {
    const res = await axios.get(`${this.museumUrl}/api/categories/${id}`, this.getAuthHeaders());
    return res.data;
  },

  async getAllCategories() {
    const res = await axios.get(`${this.museumUrl}/api/categories`, this.getAuthHeaders());
    return res.data;
  },

  async deleteCategory(id) {
    const res = await axios.delete(`${this.museumUrl}/api/categories/${id}`, this.getAuthHeaders());
    return res.data;
  },

  // Exhibition endpoints
  async createExhibition(museumId, exhibition) {
    const res = await axios.post(`${this.museumUrl}/api/museums/${museumId}/exhibitions`, exhibition, this.getAuthHeaders());
    return res.data;
  },

  async getExhibition(id) {
    const res = await axios.get(`${this.museumUrl}/api/exhibitions/${id}`, this.getAuthHeaders());
    return res.data;
  },

  async getAllExhibitions() {
    const res = await axios.get(`${this.museumUrl}/api/exhibitions`, this.getAuthHeaders());
    return res.data;
  },

  async getExhibitionsByMuseum(museumId) {
    const res = await axios.get(`${this.museumUrl}/api/museums/${museumId}/exhibitions`, this.getAuthHeaders());
    return res.data;
  },

  async deleteExhibition(id) {
    const res = await axios.delete(`${this.museumUrl}/api/exhibitions/${id}`, this.getAuthHeaders());
    return res.data;
  },
};
