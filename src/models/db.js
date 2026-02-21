// import { userMemStore } from "./mem/user-mem-store.ts";
// import { museumMemStore } from "./mem/museum-mem-store.ts";
// import { exhibitionMemStore } from "./mem/exhibition-mem-store.ts";

import { userJsonStore } from "./json/user-json-store.js";
import { museumJsonStore } from "./json/museum-json-store.js";
import { exhibitionJsonStore } from "./json/exhibition-json-store.js";

export const db = {
  userStore: null,
  museumStore: null,
  exhibitionStore: null,

  init() {
    this.userStore = userJsonStore;
    this.museumStore = museumJsonStore;
    this.exhibitionStore = exhibitionJsonStore;
  },
};
