import { Request, ResponseToolkit } from "@hapi/hapi";
import { MuseumSpec } from "../models/joi-schemas"; // Removed .js
import { db } from "../models/db"; // Removed .js

export const dashboardController = {
  index: {
    handler: async function (request: Request, h: ResponseToolkit) {
      const loggedInUser = request.auth.credentials as any;
      console.log("📊 Dashboard accessed by:", loggedInUser?.email || "unknown");
      
      const isAdmin = loggedInUser && loggedInUser.role === "admin";
      
      // Use ! to unlock the stores
      let museums = await db.museumStore!.getUserMuseums(loggedInUser._id);
      
      const query = request.query as any;
      const categoryId = query.categoryId;
      
      if (categoryId) {
        museums = museums.filter((museum: any) => museum.categoryId === categoryId);
      }
      
      const topVisitedMuseums = [...museums]
        .sort((a: any, b: any) => (b.museumVisitCount ?? 0) - (a.museumVisitCount ?? 0))
        .slice(0, 5);

      const categories = await db.categoryStore!.getAllCategories();
      
      const viewData = {
        title: "MyAppMusems Dashboard",
        user: loggedInUser,
        isAdmin,
        museums: museums,
        categories: categories,
        topVisitedMuseums,
        totalMuseums: museums.length,
      };
      return h.view("dashboard-view", viewData);
    },
  },

  addMuseum: {
    validate: {
      payload: MuseumSpec,
      options: { abortEarly: false },
      failAction: function (request: Request, h: ResponseToolkit, error: any) {
        return h.view("dashboard-view", { title: "Add Museum error", errors: error.details }).takeover().code(400);
      },
    },
    handler: async function (request: Request, h: ResponseToolkit) {
      const loggedInUser = request.auth.credentials as any;
      const payload = request.payload as any;
      
      const newMuseum = {
        userid: loggedInUser._id,
        title: payload.title,
        description: payload.description || "",
        categoryId: payload.categoryId || null,
        latitude: payload.latitude ? Number(payload.latitude) : null,
        longitude: payload.longitude ? Number(payload.longitude) : null,
      };
      await db.museumStore!.addMuseum(newMuseum as any);
      return h.redirect("/dashboard");
    },
  },

  deleteMuseum: {
    handler: async function (request: Request, h: ResponseToolkit) {
      const museum = await db.museumStore!.getMuseumById(request.params.id);
      if (museum) {
        await db.museumStore!.deleteMuseumById(museum._id!);
      }
      return h.redirect("/dashboard");
    },
  },

  editMuseumPage: {
    handler: async function (request: Request, h: ResponseToolkit) {
      const loggedInUser = request.auth.credentials as any;
      const isAdmin = loggedInUser && loggedInUser.role === "admin";
      const museum = await db.museumStore!.getMuseumById(request.params.id);
      const categories = await db.categoryStore!.getAllCategories();
      
      const viewData = {
        title: "Edit Museum",
        user: loggedInUser,
        isAdmin,
        museum: museum,
        categories: categories,
      };
      return h.view("edit-museum-view", viewData);
    },
  },

  editMuseum: {
    handler: async function (request: Request, h: ResponseToolkit) {
      const museumId = request.params.id;
      const payload = request.payload as any;
      const museum = await db.museumStore!.getMuseumById(museumId);

      if (museum) {
        museum.title = payload.title;
        museum.description = payload.description || "";
        museum.categoryId = payload.categoryId || null;
        museum.latitude = payload.latitude ? Number(payload.latitude) : null;
        museum.longitude = payload.longitude ? Number(payload.longitude) : null;

        await db.museumStore!.updateMuseum(museum as any);
      }
      return h.redirect("/dashboard");
    },
  },
};
