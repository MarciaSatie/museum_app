import Mongoose from "mongoose";
import { v4 } from "uuid";
import { Category } from "./category.js";

// Helper function to convert ObjectId to string
const normalizeCategory = (category) => {
  if (category && category._id) {
    return { ...category, _id: String(category._id) };
  }
  return category;
};

export const categoryMongoStore = {
  async getAllCategories() {
    const categories = await Category.find().lean();
    return categories.map(normalizeCategory);
  },

  async getCategoryById(id) {
    try {
      const category = await Category.findOne({ _id: id }).lean();
      return normalizeCategory(category);
    } catch (error) {
      return null;
    }
  },

  async addCategory(category) {
    console.log("💾 Adding category to MongoDB:", category.name);
    try {
      category._id =  v4(); // Generate UUID if not provided
      const newCategory = new Category(category);
      const categoryObj = await newCategory.save();
      console.log("✅ Category saved to MongoDB with _id:", categoryObj._id);
      const c = await this.getCategoryById(categoryObj._id);
      return c;
    } catch (error) {
      console.error("❌ Error adding category:", error.message);
      throw error;
    }
  },

  async getCategoryByName(name) {
    const category = await Category.findOne({ name: name }).lean();
    return normalizeCategory(category);
  },

  async updateCategory(category) {
    try {
      const updated = await Category.findByIdAndUpdate(category._id, category, { new: true }).lean();
      return normalizeCategory(updated);
    } catch (error) {
      return null;
    }
  },

  async deleteCategoryById(id) {
    try {
      await Category.deleteOne({ _id: id });
    } catch (error) {
      console.log("bad id");
    }
  },

  async deleteAll() {
    await Category.deleteMany({});
  },
};
