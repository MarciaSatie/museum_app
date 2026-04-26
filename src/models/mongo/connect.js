import * as dotenv from "dotenv";
import Mongoose from "mongoose";

let connectionPromise = null;

async function attemptConnect(uri) {
  return Mongoose.connect(uri, {
    serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 5000),
  });
}

export async function connectMongo() {
  dotenv.config();
  Mongoose.set("strictQuery", true);
  Mongoose.set("bufferCommands", false);

  const mongoUrl = process.env.db || process.env.MONGO_URL || process.env.MONGODB_URI;
  const fallbackMongoUrl = process.env.MONGO_FALLBACK_URL || "mongodb://127.0.0.1:27017/app_museum?directConnection=true";

  if (Mongoose.connection.readyState === 1) {
    return Mongoose.connection;
  }

  if (Mongoose.connection.readyState === 2 && connectionPromise) {
    return connectionPromise;
  }

  const primaryMongoUrl = mongoUrl || fallbackMongoUrl;

  // If someone set `db=mongo` as a mode flag, fail fast with a clear message.
  if (primaryMongoUrl === "mongo") {
    throw new Error('Invalid Mongo URI: db="mongo" is a mode flag, not a connection string. Set db, MONGO_URL, or MONGODB_URI to a real Mongo URI.');
  }

  // Basic validation: must start with mongodb:// or mongodb+srv://
  if (!/^mongodb(\+srv)?:\/\//.test(primaryMongoUrl)) {
    throw new Error("Invalid Mongo URI scheme. Expected mongodb:// or mongodb+srv://");
  }

  const db = Mongoose.connection;
  db.on("disconnected", () => {
    console.log("database disconnected");
  });

  db.once("open", () => {
    console.log(`database connected to ${db.name} on ${db.host}`);
  });

  connectionPromise = attemptConnect(primaryMongoUrl)
    .then(() => Mongoose.connection)
    .catch(async (primaryErr) => {
      const shouldTryFallback = primaryMongoUrl !== fallbackMongoUrl;
      if (!shouldTryFallback) {
        throw primaryErr;
      }
      console.log(`Primary Mongo connection failed (${primaryErr.message}). Trying local fallback URI...`);
      await attemptConnect(fallbackMongoUrl);
      console.log(`Connected using fallback Mongo URI: ${fallbackMongoUrl}`);
      return Mongoose.connection;
    })
    .catch((err) => {
      connectionPromise = null;
      throw new Error(`database connection error: ${err.message || err}`);
    });

  return connectionPromise;
}
