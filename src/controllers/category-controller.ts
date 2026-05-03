import { Request, ResponseToolkit } from "@hapi/hapi";
import { db } from "../models/db"; // Removed .js

export const categoryController = {
  listCategories: {
    handler: async function (request: Request, h: ResponseToolkit) {
      const loggedInUser = request.auth.credentials as any;
      const isAdmin = loggedInUser && loggedInUser.role === "admin";
      // Use ! to unlock the store
      const categories = await db.categoryStore!.getAllCategories();
      const viewData = {
        title: "Categories",
        user: loggedInUser,
        isAdmin,
        categories: categories,
      };
      return h.view("partials/category-list-view", viewData);
    },
  },

  addCategoryPage: {
    handler: async function (request: Request, h: ResponseToolkit) {
      const loggedInUser = request.auth.credentials as any;
      const isAdmin = loggedInUser && loggedInUser.role === "admin";
      const viewData = {
        title: "Add Category",
        user: loggedInUser,
        isAdmin,
      };
      return h.view("partials/add-category-view", viewData);
    },
  },

  addCategory: {
    handler: async function (request: Request, h: ResponseToolkit) {
      const payload = request.payload as any;
      const newCategory = {
        name: payload.name,
        location: payload.location,
        description: payload.description,
      };
      await db.categoryStore!.addCategory(newCategory as any);
      return h.redirect("/categories");
    },
  },

  deleteCategory: {
    handler: async function (request: Request, h: ResponseToolkit) {
      const categoryId = request.params.id;
      await db.categoryStore!.deleteCategoryById(categoryId);
      return h.redirect("/categories");
    },
  },

  editCategoryPage: {
    handler: async function (request: Request, h: ResponseToolkit) {
      const loggedInUser = request.auth.credentials as any;
      const isAdmin = loggedInUser && loggedInUser.role === "admin";
      const categoryId = request.params.id;
      const category = await db.categoryStore!.getCategoryById(categoryId);
      const viewData = {
        title: "Edit Category",
        user: loggedInUser,
        isAdmin,
        category: category || {},
      };
      return h.view("partials/edit-category-view", viewData);
    },
  },

  editCategory: {
    handler: async function (request: Request, h: ResponseToolkit) {
      const categoryId = request.params.id;
      const payload = request.payload as any;
      const updatedCategory = {
        _id: categoryId,
        name: payload.name,
        location: payload.location,
        description: payload.description,
      };
      await db.categoryStore!.updateCategory(updatedCategory as any);
      return h.redirect("/categories");
    },
  },
};
