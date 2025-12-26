import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { InMemoryRunner } from '@google/adk';
import { researcherAgent, createResearcherAgent } from './agents/researcher';
import { config } from './config';

const app = express();

app.use(cors());
app.use(bodyParser.json());

const runner = new InMemoryRunner({
    agent: researcherAgent,
    appName: 'AgentOrchestrator',
    // implicitly creates a new InMemorySessionService if not provided
});

app.post('/api/v1/agent/research', async (req, res) => {
    const { businessName, location, sessionId, userId, apiKey } = req.body;

    if (!businessName) {
        return res.status(400).json({ error: 'businessName is required' });
    }

    const userPrompt = `Analyze the business "${businessName}"${location ? ` located in ${location}` : ''}. Find digital gaps and meaningful insights.`;
    const effectiveSessionId = sessionId || `session-${Date.now()}`;
    const effectiveUserId = userId || 'default-user';
    const appName = 'AgentOrchestrator';

    let requestRunner = runner;
    if (apiKey) {
        // Create a temporary runner with the user's API key
        // Note: This creates a new session context as we cannot inject the existing sessionService easily.
        requestRunner = new InMemoryRunner({
            agent: createResearcherAgent(apiKey),
            appName,
        });
    }

    try {
        const sessionExists = await requestRunner.sessionService.getSession({
            appName,
            userId: effectiveUserId,
            sessionId: effectiveSessionId
        });

        if (!sessionExists) {
            await requestRunner.sessionService.createSession({
                appName,
                userId: effectiveUserId,
                sessionId: effectiveSessionId
            });
        }
    } catch (e) {
        try {
            await requestRunner.sessionService.createSession({
                appName,
                userId: effectiveUserId,
                sessionId: effectiveSessionId
            });
        } catch (createErr) { }
    }

    try {
        const events = requestRunner.runAsync({
            userId: effectiveUserId,
            sessionId: effectiveSessionId,
            newMessage: { role: 'user', parts: [{ text: userPrompt }] }
        });

        const results: any[] = [];
        let errorDetails = null;

        for await (const event of events) {
            // Check for error in event
            if (event.errorCode) {
                console.error(`Event Error: ${event.errorCode} - ${event.errorMessage}`);
                errorDetails = { code: event.errorCode, message: event.errorMessage };
            }

            if (event.content && event.content.parts) {
                const text = event.content.parts.map(p => p.text).join(' ');
                if (text) {
                    results.push({
                        type: 'response',
                        content: text,
                        timestamp: event.timestamp
                    });
                }
            }
        }

        if (errorDetails) {
            return res.status(500).json({
                error: 'Agent error',
                details: errorDetails,
                partial_trace: results
            });
        }

        const finalAnswer = results.map(r => r.content).join('\n');

        res.json({
            status: 'success',
            data: {
                summary: finalAnswer,
                trace: results
            }
        });

    } catch (error) {
        console.error('Agent execution failed:', error);
        res.status(500).json({ error: 'Agent execution failed', details: Error(error as string).message });
    }
});

const PORT = config.port || 8080;
app.listen(PORT, () => {
    console.log(`Agent Orchestrator listening on port ${PORT}`);
});
