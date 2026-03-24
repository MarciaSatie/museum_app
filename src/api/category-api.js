import Boom from "@hapi/boom";
import Joi from "joi";
import { db } from "../models/db.js";

export const categoryApi = {
  find: {
    auth: {
      strategy: "jwt",
    },

    handler: async function(request, h) {
      try {
        const categories = await db.categoryStore.getAllCategories();
        return categories;
      } catch (err) {
        console.log("Error details:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
  },

  findOne: {
    auth: {
      strategy: "jwt",
    },

    handler: async function(request, h) {
      try {
        const category = await db.categoryStore.getCategoryById(request.params.id);
        if (!category) return Boom.notFound("Category not found");
        return category;
      } catch (err) {
        console.log("Error details:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
  },

  create: {
    auth: {
      strategy: "jwt",
    },

    handler: async function(request, h) {
      try {
        const category = await db.categoryStore.addCategory(request.payload);
        return h.response(category).code(201);
      } catch (err) {
        console.log("Error details:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
    validate: {
      payload: Joi.object({
        name: Joi.string().required(),
        description: Joi.string().allow("").optional(),
        location: Joi.string().required(),
      }),
    },
  },

  update: {
    auth: {
      strategy: "jwt",
    },

    handler: async function(request, h) {
      try {
        const category = await db.categoryStore.updateCategory({ ...request.payload, _id: request.params.id });
        if (!category) return Boom.notFound("Category not found");
        return h.response(category).code(200);
      } catch (err) {
        console.log("Error details:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
    validate: {
      payload: Joi.object({
        name: Joi.string().required(),
        description: Joi.string().allow("").optional(),
        location: Joi.string().required(),
      }),
    },
  },

  delete: {
    auth: {
      strategy: "jwt",
    },

    handler: async function(request, h) {
      try {
        await db.categoryStore.deleteCategoryById(request.params.id);
        return h.response().code(204);
      } catch (err) {
        console.log("Error details:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
  },
};
