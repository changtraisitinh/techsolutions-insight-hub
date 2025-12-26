import { FunctionTool } from '@google/adk';
import { Type } from '@google/genai';
import axios from 'axios';
import { config } from '../config';

// Define params using Google GenAI Schema type to avoid Zod version conflicts
const fetchLeadsSchema = {
    type: Type.OBJECT,
    properties: {
        limit: { type: Type.NUMBER },
        saved_only: { type: Type.BOOLEAN }
    },
    required: []
};

interface FetchLeadsInput {
    limit?: number;
    saved_only?: boolean;
}

export const fetchLeadsTool = new FunctionTool({
    name: 'fetch_leads',
    description: 'Fetch business leads from the internal Maps Intelligence database',
    parameters: fetchLeadsSchema,
    execute: async (input: unknown) => {
        const { limit, saved_only } = input as FetchLeadsInput;
        try {
            const response = await axios.get(`${config.mapsServiceUrl}/api/leads`, {
                params: { limit: limit || 10, saved_only: saved_only || false },
            });
            return JSON.stringify(response.data);
        } catch (error) {
            return JSON.stringify({ error: 'Failed to fetch leads from Maps service' });
        }
    },
});

const searchLeadSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING }
    },
    required: ['name']
};

interface SearchLeadInput {
    name: string;
}

export const searchLeadByNameTool = new FunctionTool({
    name: 'search_lead_by_name',
    description: 'Search for a specific business lead by name in our database',
    parameters: searchLeadSchema,
    execute: async (input: unknown) => {
        const { name } = input as SearchLeadInput;
        try {
            const response = await axios.get(`${config.mapsServiceUrl}/api/leads`, {
                params: { limit: 100 },
            });
            const leads = response.data;
            const filtered = leads.filter((l: any) => l.name.toLowerCase().includes(name.toLowerCase()));
            return JSON.stringify(filtered);
        } catch (error) {
            return JSON.stringify({ error: 'Failed to search for lead' });
        }
    },
});
