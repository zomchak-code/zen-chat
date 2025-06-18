import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { ENV } from '../util/env';

const openRouter = createOpenRouter({ apiKey: ENV.OPEN_ROUTER_API_KEY });

class AIService {
  getModel(modelId: string) {
    if (modelId === 'gemini-2.5-flash') {
      return google(modelId);
    }
    if (modelId === 'o3-pro') {
      return openai.responses(modelId);
    }
    return openRouter(modelId);
  }
}

export const aiService = new AIService();