import { AIProvider, ProviderConfig } from './base';
import { OpenAIProvider } from './openai';
import { GeminiProvider } from './gemini';

export type ProviderType = 'openai' | 'gemini' | 'lm-studio' | 'anthropic';

export class ProviderFactory {
    /**
     * Create an AI provider based on environment configuration
     */
    static createFromEnv(): AIProvider {
        // Priority 1: LM Studio (local inference)
        if (process.env.USE_LM_STUDIO === 'true' && process.env.LM_STUDIO_URL) {
            console.log('🤖 Initializing LM Studio provider');
            return new OpenAIProvider({
                baseURL: process.env.LM_STUDIO_URL,
                apiKey: 'lm-studio',
            });
        }

        // Priority 2: OpenAI
        if (process.env.OPENAI_API_KEY) {
            console.log('🤖 Initializing OpenAI provider');
            return new OpenAIProvider({
                baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
                apiKey: process.env.OPENAI_API_KEY,
                model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
            });
        }

        // Priority 3: Anthropic (future implementation)
        if (process.env.ANTHROPIC_API_KEY) {
            console.log('🤖 Anthropic provider not yet implemented, falling back to Gemini');
        }

        // Default: Gemini
        console.log('🤖 Initializing Gemini provider');
        return new GeminiProvider(
            process.env.GEMINI_API_KEY,
            process.env.GEMINI_MODEL
        );
    }

    /**
     * Create a specific provider
     */
    static create(type: ProviderType, config?: ProviderConfig): AIProvider {
        switch (type) {
            case 'lm-studio':
                return new OpenAIProvider({
                    baseURL: config?.baseURL || 'http://localhost:1234/v1',
                    apiKey: 'lm-studio',
                    ...config,
                });

            case 'openai':
                if (!config?.apiKey) {
                    throw new Error('OpenAI API key is required');
                }
                return new OpenAIProvider({
                    baseURL: 'https://api.openai.com/v1',
                    ...config,
                });

            case 'gemini':
                return new GeminiProvider(config?.apiKey, config?.model);

            case 'anthropic':
                throw new Error('Anthropic provider not yet implemented');

            default:
                throw new Error(`Unknown provider type: ${type}`);
        }
    }
}
