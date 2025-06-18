import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod/v4";
import { getConvex } from "../convex/index.ts";
import { streamSSE } from 'hono/streaming'
import { messageService } from "./message.service.ts";

export const messageRouter = new Hono()
  .post("/", zValidator("json",
    z.object({ chat: z.string(), mode: z.string(), model: z.string(), text: z.string() })),
    async (c) => {
      const body = c.req.valid("json");

      const convex = getConvex();
      convex.setAuth(async () => {
        const token = c.req.header("Authorization")?.split(" ")[1];
        return token;
      });

      await messageService.create(convex, body.chat, body.text);
      return streamSSE(c, async stream => {

        const iterator = messageService.respond(convex, body.chat, body.mode, body.model);
        for await (const part of iterator) {
          if (part.type === 'message') {
            stream.writeSSE({ event: part.type, data: part.id });
          } else {
            stream.writeSSE({ event: part.type, data: part.textDelta });
          }
        }
      });
    })
  .patch("/", zValidator("json",
    z.object({ message: z.string(), mode: z.string(), model: z.string(), text: z.string() })),
    async (c) => {
      const body = c.req.valid("json");

      const convex = getConvex();
      convex.setAuth(async () => {
        const token = c.req.header("Authorization")?.split(" ")[1];
        return token;
      });

      const message = await messageService.update(convex, body.message, body.text);

      return streamSSE(c, async stream => {
        const iterator = messageService.respond(convex, message.chat, body.mode, body.model);
        for await (const part of iterator) {
          if (part.type === 'message') {
            stream.writeSSE({ event: part.type, data: part.id });
          } else {
            stream.writeSSE({ event: part.type, data: part.textDelta });
          }
        }
      });
    })
  .delete("/", zValidator("json",
    z.object({ message: z.string(), mode: z.string(), model: z.string() })),
    async (c) => {
      const body = c.req.valid("json");

      const convex = getConvex();
      convex.setAuth(async () => {
        const token = c.req.header("Authorization")?.split(" ")[1];
        return token;
      });

      const message = await messageService.delete(convex, body.message);

      return streamSSE(c, async stream => {
        const iterator = messageService.respond(convex, message.chat, body.mode, body.model);
        for await (const part of iterator) {
          if (part.type === 'message') {
            stream.writeSSE({ event: part.type, data: part.id });
          } else {
            stream.writeSSE({ event: part.type, data: part.textDelta });
          }
        }
      });
    });

