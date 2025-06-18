import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    id: v.string(),

    mode: v.string(),
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
    user: v.string(),

    name: v.string(),
  }),

  messages: defineTable({
    chat: v.id("chats"),

    user: v.optional(v.string()),

    state: v.string(),
    reasoning: v.optional(v.string()),
    text: v.string(),
  }),
});