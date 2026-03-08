import { ExhibitionSpec } from "../models/joi-schemas.js";
import { db } from "../models/db.js";

// Museum Functions
export const museumController = {
  index: {
    handler: async function (request, h) {
      const museum = await db.museumStore.getMuseumById(request.params.id);
      museum.museumVisitCount = (museum.museumVisitCount ?? 0) + 1;
      await db.museumStore.updateMuseum(museum);
      const category = museum.categoryId ? await db.categoryStore.getCategoryById(museum.categoryId) : null;
      const loggedInUser = request.auth.credentials;
      const isAdmin = loggedInUser && loggedInUser.role === "admin";
    

      // // Analitics 
      // let museumVisitCount = null;
      // try{
      //   await trackVisit("museums", museum._id);
      //   museumVisitCount = await getVisitCount("museums", museum._id);
      // }catch(err){console.log("Track Visit ERROR: "+err)}
      
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
