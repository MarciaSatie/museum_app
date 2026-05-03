import * as dotenv from "dotenv";
import Mongoose from "mongoose";

// Define the type for our promise - it will resolve to a Mongoose instance
let connectionPromise: Promise<typeof Mongoose> | null = null;

async function attemptConnect(uri: string): Promise<typeof Mongoose> {
  return Mongoose.connect(uri, {
    serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 5000),
  });
}

export async function connectMongo(): Promise<typeof Mongoose> {
  dotenv.config();
  Mongoose.set("strictQuery", true);
  Mongoose.set("bufferCommands", false);

  // Cast these to strings so TS knows they aren't 'undefined'
  const mongoUrl = (process.env.db || process.env.MONGO_URL || process.env.MONGODB_URI) as string;
  const fallbackMongoUrl = (process.env.MONGO_FALLBACK_URL || "mongodb://127.0.0.1:27017/app_museum?directConnection=true") as string;

  if (Mongoose.connection.readyState === 1) {
    return Mongoose as any; // Returning the Mongoose instance
  }

  if (Mongoose.connection.readyState === 2 && connectionPromise) {
    return connectionPromise;
  }

  const primaryMongoUrl = mongoUrl || fallbackMongoUrl;

  if (primaryMongoUrl === "mongo") {
    throw new Error('Invalid Mongo URI: db="mongo" is a mode flag, not a connection string.');
  }

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
    .then(() => Mongoose)
    .catch(async (primaryErr: any) => {
      const shouldTryFallback = primaryMongoUrl !== fallbackMongoUrl;
      if (!shouldTryFallback) {
        throw primaryErr;
      }
      console.log(`Primary Mongo connection failed (${primaryErr.message}). Trying local fallback...`);
      await attemptConnect(fallbackMongoUrl);
      return Mongoose;
    })
    .catch((err: any) => {
      connectionPromise = null;
      throw new Error(`database connection error: ${err.message || err}`);
    });

  return connectionPromise;
}
