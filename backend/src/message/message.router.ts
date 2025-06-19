import { Hono, type Context } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod/v4";
import { getConvex, type Id } from "../convex/index.ts";
import { streamSSE } from 'hono/streaming';
import { messageService } from "./message.service.ts";
import type { ConvexClient } from "convex/browser";

function streamResponse(c: Context, convex: ConvexClient, id: Id<'chats'>, mode: string, model: string) {
  return streamSSE(c, async stream => {
    const iterator = messageService.respond(convex, id, mode, model);
    for await (const part of iterator) {
      if (part.type === 'message') {
        stream.writeSSE({ event: part.type, data: part.id });
      } else {
        stream.writeSSE({ event: part.type, data: part.textDelta });
      }
    }
  });
}

export const messageRouter = new Hono()
  .post("/", zValidator("json",
    z.object({ chatId: z.string(), mode: z.string(), model: z.string(), text: z.string() })),
    async (c) => {
      const body = c.req.valid("json");
      const convex = getConvex(c.req.header("Authorization"));

      await messageService.create(convex, body.chatId as Id<'chats'>, body.text);
      return streamResponse(c, convex, body.chatId as Id<'chats'>, body.mode, body.model);
    })
  .patch("/", zValidator("json",
    z.object({ id: z.string(), mode: z.string(), model: z.string(), text: z.string() })),
    async (c) => {
      const body = c.req.valid("json");
      const convex = getConvex(c.req.header("Authorization"));

      const message = await messageService.update(convex, body.id as Id<'messages'>, body.text);
      return streamResponse(c, convex, message.chatId, body.mode, body.model);
    })
  .delete("/", zValidator("json",
    z.object({ id: z.string(), mode: z.string(), model: z.string() })),
    async (c) => {
      const body = c.req.valid("json");
      const convex = getConvex(c.req.header("Authorization"));

      const message = await messageService.delete(convex, body.id as Id<'messages'>);
      return streamResponse(c, convex, message.chatId, body.mode, body.model);
    })
  .post('/stop/:id', async c => {
    const message = c.req.param('id');
    messageService.stop(message);
    return c.text('ok');
  });

