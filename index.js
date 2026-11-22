import "dotenv/config";
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { ensureApplicationIndexes } from "./src/controllers/application.controller.js";

const PORT = process.env.PORT || 5000;

if (process.env.VERCEL) {
  // Vercel: listen lagbe na, shudhu app export hobe
  connectDB()
    .then(() => ensureApplicationIndexes())
    .catch((err) => console.error("Startup error:", err));
} else {
  connectDB()
    .then(async () => {
      await ensureApplicationIndexes();
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error("Failed to connect to database:", err);
      process.exit(1);
    });
}

export default app;