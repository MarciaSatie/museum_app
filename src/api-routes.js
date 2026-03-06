import { museumApi } from "./api/museum-api.js";
import { categoryApi } from "./api/category-api.js";
import { exhibitionApi } from "./api/exhibition-api.js";

export const apiRoutes = [
  // Museum endpoints
  { method: "GET", path: "/api/museums", config: museumApi.find },
  { method: "GET", path: "/api/museums/{id}", config: museumApi.findOne },
  { method: "POST", path: "/api/museums", config: museumApi.create },
  { method: "PUT", path: "/api/museums/{id}", config: museumApi.update },
  { method: "DELETE", path: "/api/museums/{id}", config: museumApi.delete },
  
  // Category endpoints
  { method: "GET", path: "/api/categories", config: categoryApi.find },
  { method: "GET", path: "/api/categories/{id}", config: categoryApi.findOne },
  { method: "POST", path: "/api/categories", config: categoryApi.create },
  { method: "PUT", path: "/api/categories/{id}", config: categoryApi.update },
  { method: "DELETE", path: "/api/categories/{id}", config: categoryApi.delete },
  
  // Exhibition endpoints
  { method: "GET", path: "/api/exhibitions", config: exhibitionApi.find },
  { method: "GET", path: "/api/exhibitions/{id}", config: exhibitionApi.findOne },
  { method: "GET", path: "/api/museums/{museumId}/exhibitions", config: exhibitionApi.findByMuseum },
  { method: "POST", path: "/api/museums/{museumId}/exhibitions", config: exhibitionApi.create },
  { method: "PUT", path: "/api/exhibitions/{id}", config: exhibitionApi.update },
  { method: "DELETE", path: "/api/exhibitions/{id}", config: exhibitionApi.delete },
];