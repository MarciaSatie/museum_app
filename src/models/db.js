import { userMemStore } from "./mem/user-mem-store.js";
import { museumMemStore } from "./mem/museum-mem-store.js";
import { exhibitionMemStore } from "./mem/exhibition-mem-store.js";
import { connectMongo } from "./mongo/connect.js";
import { userMongoStore } from "./mongo/user-mongo-store.js";
import { museumMongoStore } from "./mongo/museum-mongo-store.js";
import { exhibitionMongoStore } from "./mongo/exhibition-mongo-store.js";
import { categoryMongoStore } from "./mongo/category-mongo-store.js";

export const db = {
  userStore: null,
  museumStore: null,
  exhibitionStore: null,
  categoryStore: null,

  async init(storeType) {
    switch (storeType) {
      case "memory":
        // Memory mode: All data in RAM (fastest, lost on restart)
        this.userStore = userMemStore;
        this.museumStore = museumMemStore;
        this.exhibitionStore = exhibitionMemStore;
        // Categories still unavailable in memory mode
        break;
      case "mongo":
        // MongoDB mode: All non-image data in MongoDB Atlas
        await connectMongo();
        this.userStore = userMongoStore;
        this.museumStore = museumMongoStore;
        this.exhibitionStore = exhibitionMongoStore;
        this.categoryStore = categoryMongoStore;
        break;
      default:
        // Default: All non-image data in MongoDB Atlas
        await connectMongo();
        this.userStore = userMongoStore;
        this.museumStore = museumMongoStore;
        this.exhibitionStore = exhibitionMongoStore;
        this.categoryStore = categoryMongoStore;
    }
  },
};