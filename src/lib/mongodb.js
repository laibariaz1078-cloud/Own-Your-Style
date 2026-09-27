import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI?.trim();

let cached = globalThis.__mongoose;

if (!cached) {
  cached = globalThis.__mongoose = { connection: null, promise: null };
}

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is required. Add your Atlas connection string to the .env file.");
  }

  if (cached.connection) return cached.connection;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    }).catch((error) => {
      cached.promise = null;
      throw error;
    });
  }

  cached.connection = await cached.promise;
  return cached.connection;
}