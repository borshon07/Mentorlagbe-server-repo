import "dotenv/config";
import { auth } from "../config/auth.js";
import { getDB, getClient } from "../config/db.js";

const ADMIN = {
  name: "MentorLagbe Admin",
  email: "admin@mentorlagbe.com",
  password: "Admin@12345",
};

async function seedAdmin() {
  const db = getDB();
  const users = db.collection("users");

  const existing = await users.findOne({ email: ADMIN.email });

  if (!existing) {
    await auth.api.signUpEmail({ body: ADMIN });
    console.log("Admin user created");
  } else {
    console.log("Admin user already exists");
  }

  await users.updateOne(
    { email: ADMIN.email },
    { $set: { role: "admin", plan: "free" } }
  );
  console.log("Admin role set:", ADMIN.email);

  await getClient().close();
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});