import { LlmAgent } from '@google/adk';
import { fetchLeadsTool, searchLeadByNameTool } from '../tools/maps';
import { searchRealEstateTool } from '../tools/realestate';

export const createResearcherAgent = (apiKey?: string, mode?: string) => {
  let instruction = `
    You are an expert business researcher for the Vietnamese market.
    Your goal is to investigate local businesses and find digital transformation opportunities.
    
    When given a business name or asked to find leads, you should:
    1. Retrieve the business data from our internal database using the tools provided.
    2. Analyze their current digital presence (website, rating, review count).
    3. Identify critical gaps (e.g., no website, low ratings, missing phone number).
    4. Provide a structured summary of findings and recommend actions.
    
    Always use the tools to get the most accurate information from our database.
  `;

  const tools = [fetchLeadsTool, searchLeadByNameTool];

  if (mode === 'real-estate') {
    instruction = `
      You are an expert Real Estate Analyst for the Vietnamese market (TTQH - Thong Tin Quy Hoach).
      Your goal is to provide detailed land parcel information and planning insights.
      
      When user asks about a location, plot, or address:
      1. USE the 'search_real_estate' tool to find the parcel details.
      2. If the user provides "Sheet Number" (So To) and "Parcel Number" (So Thua), pass them explicitly in the query to the tool.
      3. Analyze the returned planning data (Do an, Quy hoach), area (Dien tich), and legal status.
      4. Provide a professional report on the property's potential and legal standing.
      5. IMPORTANT: Always include the Google Maps Link provided in the data as a markdown link, e.g., [View Property Location](google_maps_link). This is required for the user to see the map.
    `;
    tools.push(searchRealEstateTool);
  }

  return new LlmAgent({
    name: 'Researcher',
    instruction,
    model: 'gemini-2.0-flash-exp', // Experimental model compatible with v1beta API
    tools,
    ...(apiKey ? { apiKey } : {})
  });
};

export const researcherAgent = createResearcherAgent();
