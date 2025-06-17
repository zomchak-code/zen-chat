import { hc } from "hono/client";
import type { AppType } from "backend";
import { ENV } from "$lib/util/env";
import { authService } from "./auth";


function getHeaders(token?: string | null) {
  return token ? {
    headers: {
      Authorization: `Bearer ${token}`
    }
  } : undefined;
}

function getClient(token?: string | null){
  return hc<AppType>(ENV.VITE_BACKEND_URL, getHeaders(token));
}

export let backend = getClient();

authService.onAuthStateChange(async ({session}) => {
  backend = getClient(await session?.getToken({template: 'convex'}));
});