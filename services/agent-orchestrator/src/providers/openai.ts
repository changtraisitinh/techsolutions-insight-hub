import OpenAI from 'openai';
import axios from 'axios';
import { AIProvider, ProviderConfig, PROMPTS } from './base';

export class OpenAIProvider implements AIProvider {
    name: string;
    private client: OpenAI;
    private config: ProviderConfig;

    constructor(config: ProviderConfig) {
        this.config = config;

        // Set name based on whether we're using local LM Studio or OpenAI
        const isLocal = config.baseURL?.includes('localhost') || config.baseURL?.includes('127.0.0.1');
        this.name = isLocal ? 'LM Studio' : 'OpenAI';

        this.client = new OpenAI({
            baseURL: config.baseURL || 'https://api.openai.com/v1',
            apiKey: config.apiKey || 'not-needed-for-local',
        });
    }

    async execute(query: string, mode: string = 'general', context?: string): Promise<string> {
        const systemPrompt = PROMPTS[mode as keyof typeof PROMPTS] || PROMPTS.general;

        // Auto-detect model if using LM Studio
        let modelId = this.config.model || 'gpt-3.5-turbo';

        if (this.config.baseURL?.includes('localhost') || this.config.baseURL?.includes('127.0.0.1')) {
            // Check if explicit model is specified
            const explicitModel = process.env.LM_STUDIO_MODEL;
            if (explicitModel) {
                modelId = explicitModel;
                console.log(`📡 Using specified model: ${modelId}`);
            } else {
                // Auto-detect from available models
                try {
                    const models = await this.client.models.list();
                    modelId = models.data[0]?.id || modelId;
                    console.log(`📡 Auto-detected model: ${modelId}`);
                } catch (e) {
                    console.warn('Failed to auto-detect model, using default');
                }
            }
        }

        const completion = await this.client.chat.completions.create({
            model: modelId,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: query + (context || '') }
            ],
            temperature: this.config.temperature || 0.7,
            max_tokens: this.config.maxTokens || 1000,
        });

        return completion.choices[0].message.content || 'No response generated.';
    }

    async isAvailable(): Promise<boolean> {
        try {
            await this.client.models.list();
            return true;
        } catch {
            return false;
        }
    }
}
