/**
 * Base interface for all AI providers
 */
export interface AIProvider {
    name: string;

    /**
     * Execute a research query
     * @param query - The user's query
     * @param mode - Research mode (general, real-estate, etc.)
     * @param context - Optional additional context data (e.g. search results)
     * @returns The AI's response
     */
    execute(query: string, mode: string, context?: string): Promise<string>;

    /**
     * Check if the provider is available/configured
     */
    isAvailable(): Promise<boolean>;
}

/**
 * Configuration for AI providers
 */
export interface ProviderConfig {
    apiKey?: string;
    baseURL?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
}

/**
 * Research mode prompts
 */
export const PROMPTS = {
    general: `You are an expert business researcher for the Vietnamese market.
Your goal is to investigate local businesses and find digital transformation opportunities.

When given a business name or asked to find leads, you should:
1. Use the tools provided to get data.
2. Analyze their current digital presence (website, rating, review count).
3. Identify critical gaps (e.g., no website, low ratings, missing phone number).
4. Provide a structured summary of findings and recommend actions.`,

    'real-estate': `You are an expert Real Estate Analyst for the Vietnamese market (TTQH - Thong Tin Quy Hoach).
Your goal is to provide detailed land parcel information and planning insights.

When user asks about a location, plot, or address:
1. USE the search_real_estate tool to find the parcel details.
2. If the user provides "Sheet Number" (So To) and "Parcel Number" (So Thua), pass them explicitly in the query to the tool.
3. Analyze the returned planning data (Do an, Quy hoach), area (Dien tich), and legal status.
4. Provide a professional report on the property's potential and legal standing.
5. IMPORTANT: Always include the Google Maps Link provided in the data as a markdown link, e.g., [View Property Location](google_maps_link).`,

    marketing: `You are an expert Marketing Analyst for the Vietnamese market.
Analyze marketing strategies, social media presence, and customer engagement opportunities.`,

    competitor: `You are an expert Competitive Intelligence Analyst.
Analyze market positioning, pricing strategies, and competitive advantages.`,

    leads: `You are an expert Lead Generation Analyst.
Identify high-potential prospects and recommend outreach strategies.`
};
