import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: { chatId: v.id('chats'), text: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const message = await ctx.db.insert('messages', { ...args, user: identity?.subject, state: identity ? 'done' : 'in_progress' });
    await ctx.db.insert('messages', { chatId: args.chatId, state: 'in_progress', text: '' })
    return message;
  },
});

export const get = query({
  args: { chatId: v.id('chats') },
  handler: (ctx, args) => ctx.db.query('messages').filter(q => q.eq(q.field('chatId'), args.chatId)).take(100),
});

export const patch = mutation({
  args: {
    id: v.id('messages'),
    state: v.optional(v.string()),
    text: v.optional(v.string()),
    reasoning: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const storedMessage = await ctx.db.get(args.id);
    if (!storedMessage) throw new Error("Message not found");
    if (storedMessage.user) {
      const followingMessages = await ctx.db.query('messages')
        .filter(q => q.and(
          q.eq(q.field('chatId'), storedMessage.chatId),
          q.gt(q.field('_creationTime'), storedMessage._creationTime))
        )
        .take(100);
      await Promise.all(followingMessages.map(message => ctx.db.delete(message._id)));
      await ctx.db.insert('messages', { chatId: storedMessage.chatId, state: 'in_progress', text: '' })
    }
    const patch: Record<string, string> = {};
    if (args.state) {
      patch.state = args.state;
      storedMessage.state = args.state;
    }
    if (args.text) {
      patch.text = args.text;
      storedMessage.text = args.text;
    }
    if (args.reasoning) {
      patch.reasoning = args.reasoning;
      storedMessage.reasoning = args.reasoning;
    }
    await ctx.db.patch(args.id, patch);
    return storedMessage;
  }
});

export const remove = mutation({
  args: { id: v.id('messages') },
  handler: async (ctx, args) => {
    const storedMessage = await ctx.db.get(args.id);
    if (!storedMessage) throw new Error("Message not found");
    const followingMessages = await ctx.db.query('messages')
      .filter(q => q.and(
        q.eq(q.field('chatId'), storedMessage.chatId),
        q.gte(q.field('_creationTime'), storedMessage._creationTime))
      )
      .take(100);
    await Promise.all(followingMessages.map(message => ctx.db.delete(message._id)));
    await ctx.db.insert('messages', { chatId: storedMessage.chatId, state: 'in_progress', text: '' })
    return storedMessage;
  }
});