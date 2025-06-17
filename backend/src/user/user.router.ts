import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod/v4";
import { api, getConvex } from "../convex/index.ts";

const schema = z.object({
  data: z.object({
    id: z.string(),
    image_url: z.url()
  })
});

export const userRouter = new Hono()
  .post("/", zValidator("json", schema),
    async (c) => c.json(await getConvex().mutation(api.user.create, c.req.valid("json"))));

