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
    const node = document.getElementById('sign-in');
    if (!node) throw new Error("Sign in node not found");
    clerk.mountSignIn(node as HTMLDivElement, {
      withSignUp: true,
      appearance: {
        baseTheme: mode === 'dark' ? dark : undefined,
      }
    });
  }
  signOut() {
    clerk.signOut();
  }
  async openProfile(mode?: 'light' | 'dark') {
    await promise;
    clerk.openUserProfile({
      appearance: {
        baseTheme: mode === 'dark' ? dark : undefined,
      }
    });
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
