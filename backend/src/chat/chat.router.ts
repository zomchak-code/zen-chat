import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod/v4";
import { getConvex } from "../convex/index.ts";
import { chatService } from "./chat.service.ts";
import { streamSSE } from 'hono/streaming'
import { messageService } from "../message/message.service.ts";

const schema = z.object({ mode: z.string(), model: z.string(), text: z.string() });

export const chatRouter = new Hono()
  .post("/", zValidator("json", schema), async (c) => {
    const body = c.req.valid("json");
    const convex = getConvex(c.req.header("Authorization"));

    const chat = await chatService.create(convex, body.text);

    return streamSSE(c, async stream => {
      stream.writeSSE({ event: 'chat', data: chat });

      const iterator = messageService.respond(convex, chat, body.mode, body.model);
      for await (const part of iterator) {
        if (part.type === 'message') {
          stream.writeSSE({ event: part.type, data: part.id });
        } else {
          stream.writeSSE({ event: part.type, data: part.textDelta });
        }
      }
    });
  });

