import { useClerkContext } from "svelte-clerk";

import { Clerk } from '@clerk/clerk-js'
import { ENV } from "$lib/util/env";
import type { ListenerCallback } from '@clerk/types';
import { dark } from "@clerk/themes";

export const clerk = new Clerk(ENV.VITE_CLERK_PUBLISHABLE_KEY);
await clerk.load({
  // Set load options here
})

class AuthService {
  signIn(mode: 'light' | 'dark') {
    console.log(mode);
    clerk.mountSignIn(document.getElementById('sign-in'), {
      withSignUp: true,
      appearance: {
        baseTheme: mode === 'dark' ? dark : undefined
      }
    });
  }
  getUser() {
    return clerk.user;
  }
  async getToken() {
    return await clerk.session?.getToken({ template: 'convex' });
  }
  onAuthStateChange(listener: ListenerCallback) {
    clerk.addListener(listener);
  }
}

export const authService = new AuthService();
