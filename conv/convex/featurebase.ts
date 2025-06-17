'use node';
import { action } from "./_generated/server";
import crypto from "crypto";

export const verify = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    return {
      ...identity,
      userHash: crypto
        .createHmac('sha256', process.env.FEATUREBASE_IDENTITY_VERIFICATION_SECRET as string)
        .update(identity.subject)
        .digest('hex')
    }
  },
});
