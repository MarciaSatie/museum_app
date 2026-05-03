import { connectMongo } from "./mongo/connect";
import { userMongoStore } from "./mongo/user-mongo-store";
import { museumMongoStore } from "./mongo/museum-mongo-store";
import { exhibitionMongoStore } from "./mongo/exhibition-mongo-store";
import { categoryMongoStore } from "./mongo/category-mongo-store";

// 1. Define the "Shape" of your database object
interface Db {
  userStore: any;
  museumStore: any;
  exhibitionStore: any;
  categoryStore: any;
  init(storeType?: string): Promise<void>;
}

// 2. Apply the interface to your constant
export const db: Db = {
  userStore: null,
  museumStore: null,
  exhibitionStore: null,
  categoryStore: null,

  async init(storeType = "mongo") {
    switch (storeType) {
      default:
        await connectMongo();
        this.userStore = userMongoStore;
        this.museumStore = museumMongoStore;
        this.exhibitionStore = exhibitionMongoStore;
        this.categoryStore = categoryMongoStore;
    }
  },
};
