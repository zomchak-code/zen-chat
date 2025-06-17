import { z } from "zod/v4";

const envSchema = z.object({
  VITE_BACKEND_URL: z.url(),

  VITE_CONVEX_URL: z.url(),

  VITE_CLERK_PUBLISHABLE_KEY: z.string(),
});

export const ENV = envSchema.parse(import.meta.env);
