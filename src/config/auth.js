import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { connectDB, getClient } from "./db.js";

const db = await connectDB();

const NAME_REGEX = /^[A-Za-z]+(?:[ .'-][A-Za-z]+)*$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{8,}$/;

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(db, { client: getClient() }),
  trustedOrigins: [process.env.CLIENT_URL].filter(Boolean),

  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },

  socialProviders: process.env.GOOGLE_CLIENT_ID
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      }
    : {},

  user: {
    modelName: "users",
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "student",
        input: false,
      },
      plan: {
        type: "string",
        required: false,
        defaultValue: "free",
        input: false,
      },
      phone: { type: "string", required: false },
      bio: { type: "string", required: false },
      // Sign-up e shudhu student/tutor choose korar jonno. DB te save hoy na.
      signupRole: { type: "string", required: false, input: true },
    },
  },

  // Request er age: email sign-up e password complexity enforce
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const password = String(ctx.body?.password || "");
        if (!PASSWORD_REGEX.test(password)) {
          throw new APIError("BAD_REQUEST", {
            message:
              "Password must have uppercase, lowercase, number and special character",
          });
        }
      }
    }),
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const { signupRole, ...rest } = user;

          // Email sign-up e signupRole thake; Google e thake na
          const isEmailSignup = !!signupRole;
          if (
            isEmailSignup &&
            !NAME_REGEX.test(String(user.name || "").trim())
          ) {
            throw new Error("Please enter a valid English name.");
          }

          const role = signupRole === "tutor" ? "tutor" : "student";
          return { data: { ...rest, role, plan: "free" } };
        },
      },
      update: {
        before: async (data) => {
          // role, plan, signupRole kokhono update diye bodlano jabe na
          const { role, plan, signupRole, ...safe } = data;
          return { data: safe };
        },
      },
    },
  },
});