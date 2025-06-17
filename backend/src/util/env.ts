import { z } from "zod/v4";

const envSchema = z.object({
  ID_ALPHABET: z.string()
    .default("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz"),

  CONVEX_URL: z.url(),

  CLERK_SECRET_KEY: z.string().nonempty(),
  JWKS_URI: z.url(),

  OPEN_ROUTER_API_KEY: z.string().nonempty(),
});

export const ENV = envSchema.parse(process.env);
