import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod/v4";
import { getConvex } from "../convex/index.ts";
import { chatService } from "./chat.service.ts";
import { streamSSE } from 'hono/streaming'
import { messageService } from "../message/message.service.ts";

const schema = z.object({ mode: z.string(), text: z.string() });

export const chatRouter = new Hono()
  .post("/", zValidator("json", schema), async (c) => {
    const body = c.req.valid("json");

    const convex = getConvex();
    convex.setAuth(async () => {
      const token = c.req.header("Authorization")?.split(" ")[1];
      return token;
    });

    return streamSSE(c, async stream => {
      const chat = await chatService.create(convex, body.text);

      stream.writeSSE({ event: 'chat', data: chat });

      const iterator = messageService.respond(convex, chat, body.mode);
      for await (const part of iterator) {
        stream.writeSSE({ event: part.type, data: part.textDelta });
      }
    });
  });

