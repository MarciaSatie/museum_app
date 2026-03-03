import { museumApi } from "./api/museum-api.js";

export const apiRoutes = [
    { method: "GET", path: "/api/museums", config: museumApi.find },
    { method: "POST", path: "/api/museums", config: museumApi.create },
    { method: "DELETE", path: "/api/museums/{id}", config: museumApi.delete },
    { method: "PUT", path: "/api/museums/{id}", config: museumApi.update },
  ];