import { InMemoryRunner } from '@google/adk';
import { researcherAgent } from './agents/researcher';
import * as readline from 'readline';

const runner = new InMemoryRunner({
    agent: researcherAgent,
    appName: 'AgentOrchestratorCLI',
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const sessionId = `cli-session-${Date.now()}`;
const userId = 'cli-user';
const appName = 'AgentOrchestratorCLI';

console.log('🤖 Agent Orchestrator CLI');
console.log('Type your request (e.g., "Analyze Coffee Shop ABC in District 1")');

// Wrap logic in an async IIFE to allow top-level await for session creation
(async () => {
    // initialize session
    try {
        await runner.sessionService.createSession({
            appName,
            userId,
            sessionId
        });
    } catch (err) {
        console.error("Failed to init session", err);
        process.exit(1);
    }

    const ask = () => {
        rl.question('> ', async (input) => {
            if (input.toLowerCase() === 'exit') {
                rl.close();
                process.exit(0);
                return;
            }

            try {
                const events = runner.runAsync({
                    userId,
                    sessionId,
                    newMessage: { role: 'user', parts: [{ text: input }] }
                });

                for await (const event of events) {
                    if (event.content && event.content.parts) {
                        const text = event.content.parts.map(p => p.text).join(' ');
                        process.stdout.write(text); // Stream output
                    }
                }
                console.log('\n'); // New line after response
            } catch (error) {
                console.error('Error:', error);
            }

            ask();
        });
    };

    ask();
})();
