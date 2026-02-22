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
      case "mongo":
        // connect to Mongo and use the mongo-backed user store
        connectMongo();
        this.userStore = userMongoStore;
        // keep JSON stores for museums/exhibitions for now
        this.museumStore = museumJsonStore;
        this.exhibitionStore = exhibitionJsonStore;
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