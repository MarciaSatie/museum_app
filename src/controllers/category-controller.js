import { db } from "../models/db.js";

export const categoryController = {
  listCategories: {
    handler: async function (request, h) {
      const categories = await db.categoryStore.getAllCategories();
      const viewData = {
        title: "Categories",
        categories: categories,
      };
      return h.view("partials/category-list-view", viewData);
    },
  },

  addCategoryPage: {
    handler: async function (request, h) {
      const viewData = {
        title: "Add Category",
      };
      return h.view("partials/add-category-view", viewData);
    },
  },

  addCategory: {
    handler: async function (request, h) {
      const newCategory = {
        name: request.payload.name,
        location: request.payload.location,
        description: request.payload.description,
      };
      await db.categoryStore.addCategory(newCategory);
      return h.redirect("/categories");
    },
  },

  deleteCategory: {
    handler: async function (request, h) {
      const categoryId = request.params.id;
      await db.categoryStore.deleteCategoryById(categoryId);
      return h.redirect("/categories");
    },
  },

  editCategoryPage: {
    handler: async function (request, h) {
      const categoryId = request.params.id;
      const category = await db.categoryStore.getCategoryById(categoryId);
      const viewData = {
        title: "Edit Category",
        category: category || {},
      };
      return h.view("partials/edit-category-view", viewData);
    },
  },

  editCategory: {
    handler: async function (request, h) {
      const categoryId = request.params.id;
      const updatedCategory = {
        _id: categoryId,
        name: request.payload.name,
        location: request.payload.location,
        description: request.payload.description,
      };
      await db.categoryStore.updateCategory(updatedCategory);
      return h.redirect("/categories");
    },
  },
};
