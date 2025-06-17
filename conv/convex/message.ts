import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: { chat: v.id('chats'), text: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    return ctx.db.insert('messages', { ...args, user: identity?.subject });
  },
});

export const get = query({
  args: { chat: v.id('chats') },
  handler: (ctx, args) => ctx.db.query('messages').filter(q => q.eq(q.field('chat'), args.chat)).take(100),
});

export const patch = mutation({
  args: { message: v.id('messages'), text: v.optional(v.string()), reasoning: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const storedMessage = await ctx.db.get(args.message);
    if (storedMessage?.user) {
      const followingMessages = await ctx.db.query('messages')
        .filter(q => q.and(
          q.eq(q.field('chat'), storedMessage.chat),
          q.gt(q.field('_creationTime'), storedMessage._creationTime))
        )
        .take(100);
      await Promise.all(followingMessages.map(message => ctx.db.delete(message._id)));
    }
    await ctx.db.patch(args.message, { text: args.text, reasoning: args.reasoning });
    return { ...storedMessage, text: args.text, reasoning: args.reasoning };
  }
});

export const remove = mutation({
  args: { message: v.id('messages') },
  handler: async (ctx, args) => {
    const storedMessage = await ctx.db.get(args.message);
    if (!storedMessage) throw new Error("Message not found");
    const followingMessages = await ctx.db.query('messages')
      .filter(q => q.and(
        q.eq(q.field('chat'), storedMessage.chat),
        q.gte(q.field('_creationTime'), storedMessage._creationTime))
      )
      .take(100);
    await Promise.all(followingMessages.map(message => ctx.db.delete(message._id)));
    return storedMessage;
  }
});