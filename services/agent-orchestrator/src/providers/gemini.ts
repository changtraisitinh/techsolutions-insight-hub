import { InMemoryRunner } from '@google/adk';
import { createResearcherAgent } from '../agents/researcher';
import { AIProvider, PROMPTS } from './base';

export class GeminiProvider implements AIProvider {
    name = 'Gemini';
    private apiKey?: string;
    private model: string;

    constructor(apiKey?: string, model?: string) {
        this.apiKey = apiKey;
        this.model = model || 'gemini-2.0-flash-exp';
    }

    async execute(query: string, mode: string = 'general'): Promise<string> {
        const agent = createResearcherAgent(this.apiKey, mode);
        const runner = new InMemoryRunner({
            agent,
            appName: 'AgentOrchestrator',
        });

        const sessionId = `session-${Date.now()}`;
        const userId = 'default-user';
        const appName = 'AgentOrchestrator';

        try {
            // Create session
            await runner.sessionService.createSession({
                appName,
                userId,
                sessionId
            });
        } catch (e) {
            // Session might already exist
        }

        const events = runner.runAsync({
            userId,
            sessionId,
            newMessage: { role: 'user', parts: [{ text: query }] }
        });

        const results: string[] = [];
        for await (const event of events) {
            if (event.errorCode) {
                throw new Error(`${event.errorCode}: ${event.errorMessage}`);
            }

            if (event.content?.parts) {
                const text = event.content.parts.map(p => p.text).join(' ');
                if (text) results.push(text);
            }
        }

        return results.join('\n') || 'No response generated.';
    }

    async isAvailable(): Promise<boolean> {
        // Gemini availability depends on API key quota
        return true; // Assume available, will fail at runtime if not
    }
}
