import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { connectDB, getClient } from "./db.js";

const db = await connectDB();

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(db, { client: getClient() }),
  trustedOrigins: [process.env.CLIENT_URL],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  user: {
    modelName: "users",
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "student",
        input: true,
      },
      phone: { type: "string", required: false },
      bio: { type: "string", required: false },
      plan: {
        type: "string",
        defaultValue: "free",
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const role = user.role === "tutor" ? "tutor" : "student";
          return { data: { ...user, role, plan: "free" } };
        },
      },
    },
  },
});