import { ENV } from '$lib/util/env'
import posthog from 'posthog-js'
import { authService } from './auth';


class AnalService {
  init() {
    if (!(ENV.VITE_POSTHOG_KEY && ENV.VITE_POSTHOG_HOST)) return;
    posthog.init(
      ENV.VITE_POSTHOG_KEY,
      {
        api_host: ENV.VITE_POSTHOG_HOST,
        person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
      }
    )
    authService.onAuthStateChange(({ user }) => {
      if (user) {
        posthog.identify(user.id, {
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName,
          image: user.imageUrl,
        });
      } else {
        posthog.reset();
      }
    })
  }
  identify(id: string, data: Record<string, unknown>) {
    posthog.identify(id, data)
  }
  capture(event: string, data: Record<string, unknown>) {
    posthog.capture(event, data)
  }
}


export const anal = new AnalService();