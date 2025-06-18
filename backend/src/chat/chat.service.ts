import type { ConvexClient } from "convex/browser";
import { api } from "../convex/index.ts";
import { aiService } from "../ai/ai.service.ts";
import { generateText } from "ai";

class ChatService {
  async create(convex: ConvexClient, text: string) {
    const namePromise = this.generateName(text);
    const id = await convex.mutation(api.chat.create, { text });
    namePromise.then(name => convex.mutation(api.chat.patch, { id, name }));
    return id;
  }
  async generateName(message: string) {
    const model = aiService.getModel('deepseek/deepseek-chat-v3-0324:free');
    const name = await generateText({
      model,
      prompt: `Generate a title for a chat that starts with the following message: "${message}"\nOnly return the name, no other text or quotes.`,
    });
    return name.text;
  }
}

export const chatService = new ChatService();
