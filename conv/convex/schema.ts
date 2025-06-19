import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const modeSchema = v.union(v.literal("smart"), v.literal("fast"), v.literal("cheap"));
export type Mode = 'smart' | 'fast' | 'cheap';

export default defineSchema({
  users: defineTable({
    id: v.string(),

    mode: modeSchema,

    modes: v.object({
      smart: v.string(),
      fast: v.string(),
      cheap: v.string(),
    }),

    image_url: v.string(),
    creditsAvailable: v.number(),
    creditsUsed: v.number(),
  }),

  chats: defineTable({
    userId: v.string(),

    name: v.string(),
  }),

  messages: defineTable({
    chatId: v.id("chats"),

    user: v.optional(v.string()),

    state: v.string(),
    reasoning: v.optional(v.string()),
    text: v.string(),
  }),
});