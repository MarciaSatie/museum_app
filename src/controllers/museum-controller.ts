import { Request, ResponseToolkit } from "@hapi/hapi";
import { ExhibitionSpec } from "../models/joi-schemas"; // Removed .js
import { db } from "../models/db"; // Removed .js

export const museumController = {
  index: {
    handler: async function (request: Request, h: ResponseToolkit) {
      const museum = await db.museumStore!.getMuseumById(request.params.id);
      if (!museum) return h.redirect("/dashboard"); // Safety check

      museum.museumVisitCount = (museum.museumVisitCount ?? 0) + 1;
      await db.museumStore!.updateMuseum(museum as any);

      const category = museum.categoryId ? await db.categoryStore!.getCategoryById(museum.categoryId) : null;
      const loggedInUser = request.auth.credentials as any;
      const isAdmin = loggedInUser && loggedInUser.role === "admin";

      const viewData = {
        title: "Museum",
        museum: museum,
        category: category,
        user: loggedInUser,
        museumVisitCount: museum.museumVisitCount ?? 0,
        isAdmin,
      };
      return h.view("museum-view", viewData);
    },
  },

  addExhibition: {
    validate: {
      payload: ExhibitionSpec,
      options: { abortEarly: false },
      failAction: async function (request: Request, h: ResponseToolkit, error: any) {
        const currentMuseum = await db.museumStore!.getMuseumById(request.params.id);
        const loggedInUser = request.auth.credentials as any;
        const isAdmin = loggedInUser && loggedInUser.role === "admin";
        return h
          .view("museum-view", {
            title: "Add exhibition error",
            museum: currentMuseum,
            user: loggedInUser,
            isAdmin,
            errors: error.details,
          })
          .takeover()
          .code(400);
      },
    },
    handler: async function (request: Request, h: ResponseToolkit) {
      const museum = await db.museumStore!.getMuseumById(request.params.id);
      if (!museum) return h.redirect("/dashboard");

      const payload = request.payload as any;
      const newExhibition = {
        title: payload.title,
        artist: payload.artist,
        duration: payload.duration, // Keeping as string to match your ExhibitionType
      };
      await db.exhibitionStore!.addExhibition(String(museum._id), newExhibition as any);
      return h.redirect(`/museum/${museum._id}`);
    },
  },

  deleteExhibition: {
    handler: async function (request: Request, h: ResponseToolkit) {
      const museum = await db.museumStore!.getMuseumById(request.params.id);
      await db.exhibitionStore!.deleteExhibition(request.params.exhibitionid);
      return h.redirect(`/museum/${museum?._id}`);
    },
  },
};
