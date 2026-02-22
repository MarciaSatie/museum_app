import { ExhibitionSpec } from "../models/joi-schemas.js";
import { db } from "../models/db.js";

export const museumController = {
  index: {
    handler: async function (request, h) {
      const museum = await db.museumStore.getMuseumById(request.params.id);
      const loggedInUser = request.auth.credentials;
      const isAdmin = loggedInUser && loggedInUser.role === "admin";
      const viewData = {
        title: "Museum",
        museum: museum,
        user: loggedInUser,
        isAdmin,
      };
      return h.view("museum-view", viewData);
    },
  },

  addExhibition: {
    validate: {
      payload: ExhibitionSpec,
      options: { abortEarly: false },
      failAction: async function (request, h, error) {
        const currentMuseum = await db.museumStore.getMuseumById(request.params.id);
        const loggedInUser = request.auth.credentials;
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
    handler: async function (request, h) {
      const museum = await db.museumStore.getMuseumById(request.params.id);
      const newExhibition = {
        title: request.payload.title,
        artist: request.payload.artist,
        duration: Number(request.payload.duration),
      };
      await db.exhibitionStore.addExhibition(museum._id, newExhibition);
      return h.redirect(`/museum/${museum._id}`);
    },
  },

  deleteExhibition: {
    handler: async function (request, h) {
      const museum = await db.museumStore.getMuseumById(request.params.id);
      await db.exhibitionStore.deleteExhibition(request.params.exhibitionid);
      return h.redirect(`/museum/${museum._id}`);
    },
  },
};
