import { connectMongo } from "./mongo/connect";
import { userMongoStore } from "./mongo/user-mongo-store";
import { museumMongoStore } from "./mongo/museum-mongo-store";
import { exhibitionMongoStore } from "./mongo/exhibition-mongo-store";
import { categoryMongoStore } from "./mongo/category-mongo-store";
import { imageMongoStore } from "./mongo/image-mongo-store";
import { socialMongoStore } from "./mongo/social-mongo-store"; 

export const db: any = { 
  userStore: null,
  museumStore: null,
  exhibitionStore: null,
  categoryStore: null,
  imageStore: null,
  socialStore: null, 

  async init(type = "mongo") {
    if (type === "mongo") {
      await connectMongo();
      db.userStore = userMongoStore;
      db.museumStore = museumMongoStore;
      db.exhibitionStore = exhibitionMongoStore;
      db.categoryStore = categoryMongoStore;
      db.imageStore = imageMongoStore;
      db.socialStore = socialMongoStore; 
      
      console.log("Mongo storage mode activated and stores assigned.");
    }
  },
};
