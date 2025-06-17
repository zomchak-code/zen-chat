import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod/v4";
import { getConvex } from "../convex/index.ts";
import { streamSSE } from 'hono/streaming'
import { messageService } from "./message.service.ts";

const authSchema = z.object({ sub: z.string() });

export const messageRouter = new Hono()
  .post("/", zValidator("json",
    z.object({ chat: z.string(), mode: z.string(), text: z.string() })),
    async (c) => {
      const body = c.req.valid("json");

      const convex = getConvex();
      convex.setAuth(async () => {
        const token = c.req.header("Authorization")?.split(" ")[1];
        return token;
      });

      return streamSSE(c, async stream => {
        await messageService.create(convex, body.chat, body.text);

        const iterator = messageService.respond(convex, body.chat, body.mode);
        for await (const part of iterator) {
          stream.writeSSE({ event: part.type, data: part.textDelta });
        }
      });
    })
  .patch("/", zValidator("json",
    z.object({ message: z.string(), mode: z.string(), text: z.string() })),
    async (c) => {
      const body = c.req.valid("json");

      const auth = authSchema.parse(c.get('jwtPayload'));

      const convex = getConvex();
      convex.setAuth(async () => {
        const token = c.req.header("Authorization")?.split(" ")[1];
        return token;
      });

      return streamSSE(c, async stream => {
        const message = await messageService.update(convex, body.message, body.text);

        const iterator = messageService.respond(convex, message.chat, body.mode);
        for await (const part of iterator) {
          stream.writeSSE({ event: part.type, data: part.textDelta });
        }
      });
    })
  .delete("/", zValidator("json",
    z.object({ message: z.string(), mode: z.string() })),
    async (c) => {
      const body = c.req.valid("json");

      const convex = getConvex();
      convex.setAuth(async () => {
        const token = c.req.header("Authorization")?.split(" ")[1];
        return token;
      });

      return streamSSE(c, async stream => {
        const message = await messageService.delete(convex, body.message);

        const iterator = messageService.respond(convex, message.chat, body.mode);
        for await (const part of iterator) {
          stream.writeSSE({ event: part.type, data: part.textDelta });
        }
      });
    });

