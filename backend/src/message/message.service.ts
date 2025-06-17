import { api, getConvex, type Id } from "../convex/index.ts";
import { streamText } from 'ai';
import type { ConvexClient } from "convex/browser";
import { aiService } from "../ai/ai.service.ts";


const modes = {
  smart: {
    id: 'google/gemini-2.5-pro-preview',
    input: 125 / 1_000_000,
    output: 1000 / 1_000_000,
  },
  fast: {
    id: 'google/gemini-2.5-flash-preview-05-20:thinking',
    input: 15 / 1_000_000,
    output: 350 / 1_000_000,
  },
  cheap: {
    id: 'x-ai/grok-3-mini-beta',
    input: 30 / 1_000_000,
    output: 50 / 1_000_000,
  }
}

class MessageService {
  create(convex: ConvexClient, chat: Id<'chats'>, text: string) {
    return convex.mutation(api.message.create, { chat, text });
  }

  update(convex: ConvexClient, message: Id<'messages'>, text: string) {
    return convex.mutation(api.message.patch, { message, text });
  }

  delete(convex: ConvexClient, message: Id<'messages'>) {
    return convex.mutation(api.message.remove, { message });
  }

  async* respond(auth: ConvexClient, chat: Id<'chats'>, mode: string) {
    const anon = getConvex();
    let reasoning = '';
    let text = '';
    const message = await anon.mutation(api.message.create, { chat, text });
    yield { type: 'message' as const, id: message };

    const router = aiService.getRouter();
    const modelConfig = modes[mode];
    const model = router(modelConfig.id);
    const history = await anon.query(api.message.get, { chat });

    const stream = streamText({
      model,
      messages: history.map(message => ({ role: message.user ? 'user' : 'assistant', content: message.text })),
      providerOptions: {
        openrouter: {
          reasoning: {
            effort: 'high'
          }
        }
      }
    });


    const interval = setInterval(() => anon.mutation(api.message.patch, { message, reasoning, text }), 1000);

    for await (const part of stream.fullStream) {
      switch (part.type) {
        case 'reasoning': {
          yield part;
          reasoning += part.textDelta;
          break;
        }
        case 'text-delta': {
          yield part;
          text += part.textDelta;
          break;
        }
        default: {
          // console.log(part.type);
        }
      }
    }
    clearInterval(interval);
    await anon.mutation(api.message.patch, { message, reasoning, text, state: 'done' });

    const usage = await stream.usage;
    const credits = usage.promptTokens * modelConfig.input + usage.completionTokens * modelConfig.output;
    await auth.mutation(api.user.inc, { credits });

    console.log(credits);
  }
}

export const messageService = new MessageService();
