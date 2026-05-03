import { v4 } from "uuid";
import { CategoryModel, type CategoryType } from "./category";


const normalizeCategory = (category: any): CategoryType | null => {
  if (category && category._id) {
    return { ...category, _id: String(category._id) };
  }
  return category;
};

export const categoryMongoStore = {
  async getAllCategories(): Promise<CategoryType[]> {
    const categories = await CategoryModel.find().lean();
    return categories.map((c) => normalizeCategory(c) as CategoryType);
  },

  async getCategoryById(id: string): Promise<CategoryType | null> {
    try {
      if (!id) return null;
      const category = await CategoryModel.findOne({ _id: id }).lean();
      if (!category) return null;
      return normalizeCategory(category);
    } catch (error: any) {
      console.log("Error finding category:", error.message);
      return null;
    }
  },

  async addCategory(category: CategoryType): Promise<CategoryType | null> {
    console.log("💾 Adding category to MongoDB:", category.name);
    try {
      // Force a UUID as you did in your JS version
      const data = { ...category, _id: v4() };
      const newCategory = new CategoryModel(data);
      const categoryObj = await newCategory.save();
      
      console.log("✅ Category saved to MongoDB with _id:", categoryObj._id);
      return await this.getCategoryById(String(categoryObj._id));
    } catch (error: any) {
      console.error("❌ Error adding category:", error.message);
      throw error;
    }
  },

  async getCategoryByName(name: string): Promise<CategoryType | null> {
    const category = await CategoryModel.findOne({ name: name }).lean();
    return normalizeCategory(category);
  },

  async updateCategory(category: CategoryType): Promise<CategoryType | null> {
    try {
      const updated = await CategoryModel.findByIdAndUpdate(category._id, category, { 
        returnDocument: "after" 
      }).lean();
      if (!updated) return null;
      return normalizeCategory(updated);
    } catch (error: any) {
      console.log("Error updating category:", error.message);
      return null;
    }
  },

  async deleteCategoryById(id: string): Promise<void> {
    try {
      await CategoryModel.deleteOne({ _id: id });
    } catch (error) {
      console.log("bad id");
    }
  },

  async deleteAll(): Promise<void> {
    await CategoryModel.deleteMany({});
  },
};
