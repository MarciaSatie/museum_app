import * as dotenv from "dotenv";
import Mongoose from "mongoose";

export function connectMongo() {
  dotenv.config();
  Mongoose.set("strictQuery", true);

  // Accept either MONGO_URL or db in .env but guard against accidental
  // values like "mongo" which are used as mode indicators elsewhere.
  const mongoUrl = process.env.MONGO_URL || process.env.db;

  if (!mongoUrl) {
    console.log("No Mongo connection string found in environment; skipping mongo connect.");
    return;
  }

  // If someone set `db=mongo` to indicate using mongo mode, don't try to connect
  // with the literal string "mongo" (causes Mongoose parse error).
  if (mongoUrl === "mongo") {
    console.log('Environment value for DB is "mongo" (mode flag). Set MONGO_URL (or db) to a proper Mongo URI to connect. Skipping connect.');
    return;
  }

  // Basic validation: must start with mongodb:// or mongodb+srv://
  if (!/^mongodb(\+srv)?:\/\//.test(mongoUrl)) {
    console.log("Invalid Mongo URI scheme. Skipping connect. Expected mongodb:// or mongodb+srv://");
    return;
  }

  Mongoose.connect(mongoUrl).catch((err) => {
    console.log(`database connection error: ${err.message || err}`);
  });

  const db = Mongoose.connection;
  db.on("disconnected", () => {
    console.log("database disconnected");
  });

  db.once("open", function () {
    console.log(`database connected to ${this.name} on ${this.host}`);
  });
}