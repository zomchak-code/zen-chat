import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { ENV } from '../util/env';

class AIService {
  getRouter() {
    return createOpenRouter({ apiKey: ENV.OPEN_ROUTER_API_KEY });
  }
}

export const aiService = new AIService();