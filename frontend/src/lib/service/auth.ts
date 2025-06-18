import { Clerk } from '@clerk/clerk-js'
import { ENV } from "$lib/util/env";
import type { ListenerCallback } from '@clerk/types';
import { dark } from "@clerk/themes";

export const clerk = new Clerk(ENV.VITE_CLERK_PUBLISHABLE_KEY);
const promise = clerk.load({
  // Set load options here
})

class AuthService {
  async signIn(mode: 'light' | 'dark') {
    await promise;
    clerk.mountSignIn(document.getElementById('sign-in'), {
      withSignUp: true,
      appearance: {
        baseTheme: mode === 'dark' ? dark : undefined,
      }
    });
  }
  async mountButton() {
    await promise;
    clerk.mountUserButton(document.getElementById("profile"));
  }
  async getUser() {
    await promise;
    return clerk.user;
  }
  async getToken() {
    await promise;
    return await clerk.session?.getToken({ template: 'convex' });
  }
  async onAuthStateChange(listener: ListenerCallback) {
    await promise;
    clerk.addListener(listener);
  }
}

export const authService = new AuthService();
