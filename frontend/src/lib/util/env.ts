import { z } from "zod/v4";

const envSchema = z.object({
  VITE_BACKEND_URL: z.url(),

  VITE_CONVEX_URL: z.url(),

  VITE_CLERK_PUBLISHABLE_KEY: z.string(),

  VITE_POSTHOG_KEY: z.optional(z.string()),
  VITE_POSTHOG_HOST: z.optional(z.url()),

  VITE_FEATUREBASE_ORGANIZATION: z.optional(z.string()),
});

export const ENV = envSchema.parse(import.meta.env);
