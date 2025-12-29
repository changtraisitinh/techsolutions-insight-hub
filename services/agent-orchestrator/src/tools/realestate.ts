import { FunctionTool } from '@google/adk';
import { Type } from '@google/genai';
import axios from 'axios';

const REAL_ESTATE_SERVICE_URL = process.env.REAL_ESTATE_SERVICE_URL || 'http://localhost:8002';

const searchSchema = {
    type: Type.OBJECT,
    properties: {
        query: {
            type: Type.STRING,
            description: 'The search query for real estate parcels. Can be a natural language string containing sheet number (so to), parcel number (so thua), and address/ward (phuong/xa). Example: "so to 57 so thua 8 phuong tan phu" or "le loi district 1".'
        }
    },
    required: ['query']
};

interface SearchRealEstateInput {
    query: string;
}

export const searchRealEstateTool = new FunctionTool({
    name: 'search_real_estate',
    description: 'Search for real estate parcel information, including sheet number, parcel number, area, planning details, and location.',
    parameters: searchSchema,
    execute: async (input: unknown) => {
        const { query } = input as SearchRealEstateInput;
        try {
            console.log(`[RealEstateTool] Searching for: ${query}`);
            const response = await axios.get(`${REAL_ESTATE_SERVICE_URL}/api/search-parcels`, {
                params: { q: query }
            });

            const { data, count } = response.data;
            if (count === 0) {
                return "No real estate parcels found matching that query.";
            }

            // Format the output for the model
            return `Found ${count} parcels:\n` + JSON.stringify(data, null, 2);
        } catch (error: any) {
            console.error('[RealEstateTool] Error:', error.message);
            return `Error searching real estate: ${error.message}`;
        }
    }
});
