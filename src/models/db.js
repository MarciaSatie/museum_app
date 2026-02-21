import { userJsonStore } from "./json/user-json-store.js";
import { museumJsonStore } from "./json/museum-json-store.js";
import { exhibitionJsonStore } from "./json/exhibition-json-store.js";
import { connectMongo } from "./mongo/connect.js";
import { userMongoStore } from "./mongo/user-mongo-store.js";

export const db = {
  userStore: null,
  museumStore: null,
  exhibitionStore: null,

  init(storeType) {
    switch (storeType) {
      case "mongo":
        // connect to Mongo and use the mongo-backed user store
        connectMongo();
        this.userStore = userMongoStore;
        // keep JSON stores for museums/exhibitions for now (you can migrate those later)
        this.museumStore = museumJsonStore;
        this.exhibitionStore = exhibitionJsonStore;
        break;
      default:
        // fallback to JSON stores
        this.userStore = userJsonStore;
        this.museumStore = museumJsonStore;
        this.exhibitionStore = exhibitionJsonStore;
    }
  },
};