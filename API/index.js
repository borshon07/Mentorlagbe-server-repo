import "dotenv/config";
import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";
import { ensureApplicationIndexes } from "../src/controllers/application.controller.js";

let ready;

export default async function handler(req, res) {
  if (!ready) {
    ready = connectDB().then(() => ensureApplicationIndexes());
  }
  await ready;
  return app(req, res);
}