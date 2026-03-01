import { userMemStore } from "./mem/user-mem-store.js";
import { museumMemStore } from "./mem/museum-mem-store.js";
import { exhibitionMemStore } from "./mem/exhibition-mem-store.js";
import { museumJsonStore } from "./json/museum-json-store.js";
import { exhibitionJsonStore } from "./json/exhibition-json-store.js";
import { connectMongo } from "./mongo/connect.js";
import { userMongoStore } from "./mongo/user-mongo-store.js";
import { categoryMongoStore } from "./mongo/category-mongo-store.js";

export const db = {
  userStore: null,
  museumStore: null,
  exhibitionStore: null,
  categoryStore: null,

  init(storeType) {
    switch (storeType) {
      case "memory":
        // Memory mode: All data in RAM (fastest, lost on restart)
        this.userStore = userMemStore;
        this.museumStore = museumMemStore;
        this.exhibitionStore = exhibitionMemStore;
        // Categories still unavailable in memory mode
        break;
      case "mongo":
        // MongoDB mode: Users in cloud, museums/exhibitions in JSON
        connectMongo();
        this.userStore = userMongoStore;
        this.museumStore = museumJsonStore;
        this.exhibitionStore = exhibitionJsonStore;
        this.categoryStore = categoryMongoStore;
        break;
      default:
        // Default: Users in MongoDB, Museums/Exhibitions in JSON
        connectMongo();
        this.userStore = userMongoStore;
        this.museumStore = museumJsonStore;
        this.exhibitionStore = exhibitionJsonStore;
        this.categoryStore = categoryMongoStore;
    }
  },
};