import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: { data: v.object({ id: v.string(), image_url: v.string() }) },
  handler: async (ctx, args) => ctx.db.insert('users', {
    ...args.data, mode: 'smart', creditsAvailable: 100, creditsUsed: 0
  }),
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    return ctx.db.query('users').filter(q => q.eq(q.field('id'), identity.subject)).first();
  },
});

export const update = mutation({
  args: { mode: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const user = await ctx.db.query('users').filter(q => q.eq(q.field('id'), identity.subject)).first();
    if (!user) throw new Error("User not found");
    return ctx.db.patch(user._id, { mode: args.mode });
  },
})

export const inc = mutation({
  args: { credits: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const user = await ctx.db.query('users').filter(q => q.eq(q.field('id'), identity.subject)).first();
    if (!user) throw new Error("User not found");
    return ctx.db.patch(user._id, { creditsUsed: user.creditsUsed + args.credits });
  },
});

