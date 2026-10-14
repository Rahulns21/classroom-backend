import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema/auth";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL!,
  secret: process.env.BETTER_AUTH_SECRET!,
  trustedOrigins: [process.env.FRONTEND_URL!],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "student",
        input: true,
      },
      imageCldPubId: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          // Read what the client tried to send
          const requestedRole = (ctx?.body as { role?: string })?.role;

          // Whitelist of roles a client is allowed to self-assign
          const selfAssignable = ["student", "teacher"];

          const role =
            requestedRole && selfAssignable.includes(requestedRole)
              ? requestedRole
              : "student";

          return {
            data: {
              ...user,
              role,
            },
          };
        },
      },
    },
  },
});
