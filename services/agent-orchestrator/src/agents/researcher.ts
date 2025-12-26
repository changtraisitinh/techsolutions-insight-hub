import { LlmAgent } from '@google/adk';
import { fetchLeadsTool, searchLeadByNameTool } from '../tools/maps';

export const createResearcherAgent = (apiKey?: string) => new LlmAgent({
  name: 'Researcher',
  instruction: `
    You are an expert business researcher for the Vietnamese market.
    Your goal is to investigate local businesses and find digital transformation opportunities.
    
    When given a business name or asked to find leads, you should:
    1. Retrieve the business data from our internal database using the tools provided.
    2. Analyze their current digital presence (website, rating, review count).
    3. Identify critical gaps (e.g., no website, low ratings, missing phone number).
    4. Provide a structured summary of findings and recommend actions.
    
    Always use the tools to get the most accurate information from our database.
  `,
  model: 'gemini-2.5-flash',
  tools: [fetchLeadsTool, searchLeadByNameTool],
  ...(apiKey ? { apiKey } : {})
});

export const researcherAgent = createResearcherAgent();
