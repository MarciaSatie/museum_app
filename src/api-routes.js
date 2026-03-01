import { museumApi } from "./api/museum-api.js";

export const apiRoutes = [
    { method: "GET", path: "/api/museums", config: museumApi.find },
  ];