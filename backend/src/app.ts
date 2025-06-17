import { Hono } from "hono";
import { chatRouter } from "./chat/chat.router.ts";
import { jwk } from "hono/jwk";
import { cors } from "hono/cors";
import { messageRouter } from "./message/message.router.ts";
import { userRouter } from "./user/user.router.ts";
import { ENV } from "./util/env.ts";

export const app = new Hono();

const auth = jwk({ jwks_uri: ENV.JWKS_URI });

app.use('/*', cors());
app.use("/chats/*", auth);
app.use("/messages/*", auth);

const routes = app
  .route("/users", userRouter)
  .route("/chats", chatRouter)
  .route("/messages", messageRouter);

export type AppType = typeof routes;
