import { museumApi } from "./api/museum-api.js";
import { categoryApi } from "./api/category-api.js";

export const apiRoutes = [
  // Museum endpoints
  { method: "GET", path: "/api/museums", config: museumApi.find },
  { method: "GET", path: "/api/museums/{id}", config: museumApi.findOne },
  { method: "POST", path: "/api/museums", config: museumApi.create },
  { method: "DELETE", path: "/api/museums/{id}", config: museumApi.delete },
  { method: "PUT", path: "/api/museums/{id}", config: museumApi.update },
  
  // Category endpoints
  { method: "GET", path: "/api/categories", config: categoryApi.find },
  { method: "GET", path: "/api/categories/{id}", config: categoryApi.findOne },
  { method: "POST", path: "/api/categories", config: categoryApi.create },
  { method: "PUT", path: "/api/categories/{id}", config: categoryApi.update },
  { method: "DELETE", path: "/api/categories/{id}", config: categoryApi.delete },
];