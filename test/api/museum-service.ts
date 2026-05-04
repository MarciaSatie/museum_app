import axios, { AxiosResponse } from "axios";
import { serviceUrl } from "../fixtures";
import { Museum } from "../../src/api/museum-api";
import { Category } from "../../src/api/category-api";
import { Exhibition } from "../../src/api/exhibition-api";
import { User } from "../../src/api/jwt-utils";
import "mocha";

// holds JWT token for authenticated API requests in tests.
let authToken: string | null = null; 

export const museumService = {
  museumUrl: serviceUrl,

  // Authenticate and get JWT token
  async authenticate(user: Partial<User>): Promise<void> {
    const res: AxiosResponse = await axios.post(`${this.museumUrl}/api/authenticate`, user);
    authToken = res.data.token;
  },

  getAuthHeaders() {
    return { headers: { Authorization: `Bearer ${authToken}` } };
  },

  // Museum endpoints
  async createMuseum(museum: Museum): Promise<Museum> {
    const res = await axios.post(`${this.museumUrl}/api/museums`, museum, this.getAuthHeaders());
    return res.data;
  },

  async getMuseum(id: string): Promise<Museum> {
    const res = await axios.get(`${this.museumUrl}/api/museums/${id}`, this.getAuthHeaders());
    return res.data;
  },

  async getAllMuseums(): Promise<Museum[]> {
    const res = await axios.get(`${this.museumUrl}/api/museums`, this.getAuthHeaders());
    return res.data;
  },

  async updateMuseum(id: string, museum: Museum): Promise<Museum> {
    const res = await axios.put(`${this.museumUrl}/api/museums/${id}`, museum, this.getAuthHeaders());
    return res.data;
  },

  async deleteMuseum(id: string): Promise<any> {
    const res = await axios.delete(`${this.museumUrl}/api/museums/${id}`, this.getAuthHeaders());
    return res.data;
  },

  // Category endpoints
  async createCategory(category: Category): Promise<Category> {
    const res = await axios.post(`${this.museumUrl}/api/categories`, category, this.getAuthHeaders());
    return res.data;
  },

  async getCategory(id: string): Promise<Category> {
    const res = await axios.get(`${this.museumUrl}/api/categories/${id}`, this.getAuthHeaders());
    return res.data;
  },

  async getAllCategories(): Promise<Category[]> {
    const res = await axios.get(`${this.museumUrl}/api/categories`, this.getAuthHeaders());
    return res.data;
  },

  async deleteCategory(id: string): Promise<any> {
    const res = await axios.delete(`${this.museumUrl}/api/categories/${id}`, this.getAuthHeaders());
    return res.data;
  },

  // Exhibition endpoints
  async createExhibition(museumId: string, exhibition: Exhibition): Promise<Exhibition> {
    const res = await axios.post(`${this.museumUrl}/api/museums/${museumId}/exhibitions`, exhibition, this.getAuthHeaders());
    return res.data;
  },

  async getExhibition(id: string): Promise<Exhibition> {
    const res = await axios.get(`${this.museumUrl}/api/exhibitions/${id}`, this.getAuthHeaders());
    return res.data;
  },

  async getAllExhibitions(): Promise<Exhibition[]> {
    const res = await axios.get(`${this.museumUrl}/api/exhibitions`, this.getAuthHeaders());
    return res.data;
  },

  async getExhibitionsByMuseum(museumId: string): Promise<Exhibition[]> {
    const res = await axios.get(`${this.museumUrl}/api/museums/${museumId}/exhibitions`, this.getAuthHeaders());
    return res.data;
  },

  async deleteExhibition(id: string): Promise<any> {
    const res = await axios.delete(`${this.museumUrl}/api/exhibitions/${id}`, this.getAuthHeaders());
    return res.data;
  },
};
