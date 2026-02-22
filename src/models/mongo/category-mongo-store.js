import { v4 } from "uuid";
import { Category } from "./category.js";

export const categoryMongoStore = {
  async getAllCategories() {
    const categories = await Category.find({});
    return categories.map((cat) => {
      const obj = cat.toObject();
      return { ...obj, _id: String(obj._id) };
    });
  },

  async addCategory(category) {
    const newCategory = new Category({
      _id: category._id || v4(),
      name: category.name,
      location: category.location,
      description: category.description || "",
    });
    await newCategory.save();
    const obj = newCategory.toObject();
    return { ...obj, _id: String(obj._id) };
  },

  async getCategoryById(id) {
    try {
      const category = await Category.findById(id);
      if (!category) {
        return null;
      }
      const obj = category.toObject();
      return { ...obj, _id: String(obj._id) };
    } catch (error) {
      return null;
    }
  },

  async getCategoryByName(name) {
    try {
      const category = await Category.findOne({ name: name });
      if (!category) {
        return null;
      }
      const obj = category.toObject();
      return { ...obj, _id: String(obj._id) };
    } catch (error) {
      return null;
    }
  },

  async updateCategory(category) {
    try {
      const updated = await Category.findByIdAndUpdate(category._id, category, { new: true });
      if (!updated) {
        return null;
      }
      const obj = updated.toObject();
      return { ...obj, _id: String(obj._id) };
    } catch (error) {
      return null;
    }
  },

  async deleteCategoryById(id) {
    try {
      await Category.findByIdAndDelete(id);
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  },

  async deleteAll() {
    try {
      await Category.deleteMany({});
    } catch (error) {
      console.error("Error deleting all categories:", error);
    }
  },
};
