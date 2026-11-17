import { MongoClient, ServerApiVersion } from "mongodb";

let client;
let db;

export async function connectDB() {
  if (db) return db;

  client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: false,
      deprecationErrors: true,
    },
  });

  await client.connect();
  db = client.db(process.env.DB_NAME);
  console.log("MongoDB connected");
  return db;
}

export function getDB() {
  if (!db) throw new Error("Database not connected yet");
  return db;
}

export function getClient() {
  return client;
}