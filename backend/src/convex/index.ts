import { ConvexClient } from "convex/browser";
export { api } from "../../../conv/convex/_generated/api";
import { ENV } from "../util/env.ts";
export type { Id } from "../../../conv/convex/_generated/dataModel";

export function getConvex(auth?: string) {
  const client = new ConvexClient(ENV.CONVEX_URL);
  if (auth) {
    client.setAuth(async () => {
      const token = auth?.split(" ")[1];
      return token;
    });
  }
  return client;
}

