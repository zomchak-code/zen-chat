import { api, getConvex, type Id } from "../convex/index.ts";
import { streamText } from 'ai';
import type { ConvexClient } from "convex/browser";
import { aiService } from "../ai/ai.service.ts";
import type { GoogleGenerativeAIProviderOptions } from "@ai-sdk/google";

const prices = {
  'google/gemini-2.5-pro': { input: 125, output: 1000 },
  'anthropic/claude-opus-4': { input: 1500, output: 7500 },
  'o3-pro': { input: 2000, output: 8000 },

  'gemini-2.5-flash': { input: 30, output: 250 },
  'x-ai/grok-3-mini-beta': { input: 30, output: 50 },
  'openai/o4-mini': { input: 110, output: 440 },

  'deepseek/deepseek-chat-v3-0324': { input: 30, output: 88 },
  'meta-llama/llama-4-scout': { input: 8, output: 30 },
}

const stopped = new Set<string>();

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

  async* respond(auth: ConvexClient, chat: Id<'chats'>, mode: string, modelId: string) {
    const anon = getConvex();

    const model = aiService.getModel(modelId);
    const history = await anon.query(api.message.get, { chat });

    const last = history.pop();
    if (!last) throw new Error("No history");
    const message = last._id;

    let reasoning = '';
    let text = '';
    yield { type: 'message' as const, id: message };

    const stream = streamText({
      model,
      messages: history.map(message => ({ role: message.user ? 'user' : 'assistant', content: message.text })),
      providerOptions: {
        openrouter: {
          reasoning: { enabled: mode !== 'fast' }
        },
        google: {
          thinkingConfig: { thinkingBudget: 0 }
        } satisfies GoogleGenerativeAIProviderOptions
      }
    });

    const interval = setInterval(() => anon.mutation(api.message.patch, { message, reasoning, text }), 1000);

    stopped.delete(message);
    for await (const part of stream.fullStream) {
      if (stopped.has(message)) break;
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
        case 'error': {
          console.error(part);
          yield { type: text, textDelta: `Error: ${part.error.message}` };
        }
      }
    }
    clearInterval(interval);
    await anon.mutation(api.message.patch, {
      message,
      reasoning,
      text: text || 'Stopped',
      state: 'done'
    });

    const price = prices[modelId];
    if (!price) return;
    const usage = await stream.usage;
    if (!usage) return;
    const credits = (usage.promptTokens * price.input + usage.completionTokens * price.output) / 1_000_000;
    await auth.mutation(api.user.inc, { credits });
  }
  stop(id: string) {
    stopped.add(id);
  }
}

export const messageService = new MessageService();
