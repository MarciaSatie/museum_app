import { Request, ResponseToolkit } from "@hapi/hapi";
import { MuseumSpec } from "../models/joi-schemas"; // Removed .js
import { db } from "../models/db"; // Removed .js

/**
 * Find the newest image for each museum and store it in a Map.
 * This prepares data for enriching museums with thumbnail URLs.
 */
function getLatestImageByMuseum(mongoImages: any[]) {
  const latestImageByMuseum = new Map<string, any>();

  for (const image of mongoImages as any[]) {
    if (!image.museum) continue;

    const existing = latestImageByMuseum.get(image.museum);
    const currentTs = new Date(image.createdAt || image.uploadDate || 0).getTime();
    const existingTs = existing ? new Date(existing.createdAt || existing.uploadDate || 0).getTime() : 0;

    if (!existing || currentTs > existingTs) {
      latestImageByMuseum.set(image.museum, image);
    }
  }

  return latestImageByMuseum;
}

/**
 * Add owner name and latest image URL to each museum.
 * This prepares data so the view can display a thumbnail and owner info.
 */
function enrichMuseumsWithOwnerAndImage(museums: any[], loggedInUser: any, latestImageByMuseum: Map<string, any>) {
  return museums.map((museum: any) => ({
    ...museum,
    ownerFirstName: loggedInUser.firstName || "Unknown",
    ownerLastName: loggedInUser.lastName || "Unknown",
    latestImageUrl: latestImageByMuseum.get(museum._id)?.url || null,
    latestImageName: latestImageByMuseum.get(museum._id)?.image || "",
  }));
}

/**
 * Sort museums by visit count and return the top 5.
 * This is used to show the most popular museums on the dashboard.
 */
function getTopVisitedMuseums(museums: any[], limit: number = 5) {
  return [...museums]
    .sort((a: any, b: any) => (b.museumVisitCount ?? 0) - (a.museumVisitCount ?? 0))
    .slice(0, limit);
}

export const dashboardController = {
  index: {
    /**
     * Load the user's museums, enrich them with images and owner info, and render the dashboard.
     */
    handler: async function (request: Request, h: ResponseToolkit) {
      const loggedInUser = request.auth.credentials as any;
      console.log("📊 Dashboard accessed by:", loggedInUser?.email || "unknown");

      const isAdmin = loggedInUser && loggedInUser.role === "admin";

      // Load the current user's museums
      let museums = await db.museumStore!.getUserMuseums(loggedInUser._id);

      // Prepare image data for thumbnail display
      const mongoImages = await db.imageStore!.getAllImages();
      const latestImageByMuseum = getLatestImageByMuseum(mongoImages);

      // Add owner name and latest image URL to each museum
      museums = enrichMuseumsWithOwnerAndImage(museums, loggedInUser, latestImageByMuseum);

      // Filter by category if provided in query
      const query = request.query as any;
      const categoryId = query.categoryId;
      if (categoryId) {
        museums = museums.filter((museum: any) => museum.categoryId === categoryId);
      }

      // Get top 5 most visited museums for dashboard stats
      const topVisitedMuseums = getTopVisitedMuseums(museums);

      // Load all categories for the filter dropdown
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
    /**
     * Validate and save a new museum created by the logged-in user.
     */
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
        status: payload.status || "public",
      };
      await db.museumStore!.addMuseum(newMuseum as any);
      return h.redirect("/dashboard");
    },
  },

  deleteMuseum: {
    /**
     * Delete a museum by id and redirect back to the dashboard.
     */
    handler: async function (request: Request, h: ResponseToolkit) {
      const museum = await db.museumStore!.getMuseumById(request.params.id);
      if (museum) {
        await db.museumStore!.deleteMuseumById(museum._id!);
      }
      return h.redirect("/dashboard");
    },
  },

  editMuseumPage: {
    /**
     * Load the edit form for a specific museum.
     */
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
    /**
     * Update an existing museum with new title, description, location, category, and status.
     */
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
        museum.status = payload.status || "public";

        await db.museumStore!.updateMuseum(museum as any);
      }
      return h.redirect("/dashboard");
    },
  },
};
