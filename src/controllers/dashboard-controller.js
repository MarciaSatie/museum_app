import { MuseumSpec } from "../models/joi-schemas.js";
import { db } from "../models/db.js";

export const dashboardController = {
  index: {
    handler: async function (request, h) {
      console.log("📊 Dashboard accessed by:", request.auth.credentials?.email || "unknown");
      const loggedInUser = request.auth.credentials;
      const isAdmin = loggedInUser && loggedInUser.role === "admin";
      let museums = await db.museumStore.getUserMuseums(loggedInUser._id);
      const { categoryId, location } = request.query;
      if (categoryId) {
        museums = museums.filter((museum) => museum.categoryId === categoryId);
      }

      const categories = await db.categoryStore.getAllCategories();
      const viewData = {
        title: "MyAppMusems Dashboard",
        user: loggedInUser,
        isAdmin,
        museums: museums,
        categories: categories,
      };
      return h.view("dashboard-view", viewData);
    },
  },

  addMuseum: {
    validate: {
      payload: MuseumSpec,
      options: { abortEarly: false },
      failAction: function (request, h, error) {
        return h.view("dashboard-view", { title: "Add Museum error", errors: error.details }).takeover().code(400);
      },
    },
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const newMuseum = {
        userid: loggedInUser._id,
        title: request.payload.title,
        description: request.payload.description || "",
        categoryId: request.payload.categoryId || null,
        latitude: request.payload.latitude ? Number(request.payload.latitude) : null,
        longitude: request.payload.longitude ? Number(request.payload.longitude) : null,
      };
      await db.museumStore.addMuseum(newMuseum);
      return h.redirect("/dashboard");
    },
  },

  deleteMuseum: {
    handler: async function (request, h) {
      const museum = await db.museumStore.getMuseumById(request.params.id);
      await db.museumStore.deleteMuseumById(museum._id);
      return h.redirect("/dashboard");
    },
  },

  editMuseumPage: {
    handler: async function (request, h) {
      const museum = await db.museumStore.getMuseumById(request.params.id);
      const categories = await db.categoryStore.getAllCategories();
      const viewData = {
        title: "Edit Museum",
        museum: museum,
        categories: categories,
      };
      return h.view("edit-museum-view", viewData);
    },
  },

  editMuseum: {
    handler: async function (request, h) {
      const museumId = request.params.id;
      const museum = await db.museumStore.getMuseumById(museumId);

      museum.title = request.payload.title;
      museum.description = request.payload.description || "";
      museum.categoryId = request.payload.categoryId || null;
      museum.latitude = request.payload.latitude ? Number(request.payload.latitude) : null;
      museum.longitude = request.payload.longitude ? Number(request.payload.longitude) : null;

      await db.museumStore.updateMuseum(museum);
      return h.redirect("/dashboard");
    },
  },

};
