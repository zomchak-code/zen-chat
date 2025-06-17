import { ConvexClient } from "convex/browser";
export { api } from "../../../conv/convex/_generated/api";
import { ENV } from "../util/env.ts";
export type { Id } from "../../../conv/convex/_generated/dataModel";

export function getConvex() {
  return new ConvexClient(ENV.CONVEX_URL)
}

