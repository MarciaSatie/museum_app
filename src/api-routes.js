import { museumApi } from "./api/museum-api.js";
import { categoryApi } from "./api/category-api.js";
import { exhibitionApi } from "./api/exhibition-api.js";
import { userApi } from "./api/user-api.js";

export const apiRoutes = [
  // Museum endpoints
  { method: "GET", path: "/api/museums", config: { ...museumApi.find, tags: ["api", "museums"], description: "Get all museums" } },
  { method: "GET", path: "/api/museums/{id}", config: { ...museumApi.findOne, tags: ["api", "museums"], description: "Get museum by ID" } },
  { method: "POST", path: "/api/museums", config: { ...museumApi.create, tags: ["api", "museums"], description: "Create new museum" } },
  { method: "PUT", path: "/api/museums/{id}", config: { ...museumApi.update, tags: ["api", "museums"], description: "Update museum" } },
  { method: "DELETE", path: "/api/museums/{id}", config: { ...museumApi.delete, tags: ["api", "museums"], description: "Delete museum" } },
  
  // Category endpoints
  { method: "GET", path: "/api/categories", config: { ...categoryApi.find, tags: ["api", "categories"], description: "Get all categories" } },
  { method: "GET", path: "/api/categories/{id}", config: { ...categoryApi.findOne, tags: ["api", "categories"], description: "Get category by ID" } },
  { method: "POST", path: "/api/categories", config: { ...categoryApi.create, tags: ["api", "categories"], description: "Create new category" } },
  { method: "PUT", path: "/api/categories/{id}", config: { ...categoryApi.update, tags: ["api", "categories"], description: "Update category" } },
  { method: "DELETE", path: "/api/categories/{id}", config: { ...categoryApi.delete, tags: ["api", "categories"], description: "Delete category" } },
  
  // Exhibition endpoints
  { method: "GET", path: "/api/exhibitions", config: { ...exhibitionApi.find, tags: ["api", "exhibitions"], description: "Get all exhibitions" } },
  { method: "GET", path: "/api/exhibitions/{id}", config: { ...exhibitionApi.findOne, tags: ["api", "exhibitions"], description: "Get exhibition by ID" } },
  { method: "GET", path: "/api/museums/{museumId}/exhibitions", config: { ...exhibitionApi.findByMuseum, tags: ["api", "exhibitions"], description: "Get exhibitions for a museum" } },
  { method: "POST", path: "/api/museums/{museumId}/exhibitions", config: { ...exhibitionApi.create, tags: ["api", "exhibitions"], description: "Create new exhibition" } },
  { method: "PUT", path: "/api/exhibitions/{id}", config: { ...exhibitionApi.update, tags: ["api", "exhibitions"], description: "Update exhibition" } },
  { method: "DELETE", path: "/api/exhibitions/{id}", config: { ...exhibitionApi.delete, tags: ["api", "exhibitions"], description: "Delete exhibition" } },

  // Exposes login endpoint for API clients to get JWT.
  { method: "POST", path: "/api/authenticate", config: { ...userApi.authenticate, tags: ["api", "users"], description: "Authenticate user and return JWT token" } },
];