import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const chatId = await ctx.db.insert('chats', { userId: identity.subject, name: '' });
    await ctx.db.insert('messages', { chatId, text: args.text, user: identity.subject, state: 'done' });
    await ctx.db.insert('messages', { chatId, text: '', state: 'in_progress' });
    return chatId;
  },
});

export const get = query({
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const chats = await ctx.db.query('chats')
      .filter(q => q.eq(q.field('userId'), identity.subject)).order('desc').take(1000);
    return chats;
  },
});

export const patch = mutation({
  args: { id: v.id('chats'), name: v.string() },
  handler: (ctx, args) => ctx.db.patch(args.id, { name: args.name }),
});

export const remove = mutation({
  args: { id: v.id('chats') },
  handler: (ctx, args) => ctx.db.delete(args.id),
});