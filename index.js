import "dotenv/config";
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { ensureApplicationIndexes } from "./src/controllers/application.controller.js";

const PORT = process.env.PORT || 5000;

connectDB()
  .then(async () => {
    await ensureApplicationIndexes();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  });