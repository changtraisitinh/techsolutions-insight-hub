import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

export const config = {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    port: parseInt(process.env.PORT || '8080', 10),
    mapsServiceUrl: process.env.MAPS_SERVICE_URL || 'http://localhost:8001',
};

if (!config.geminiApiKey) {
    console.warn('Warning: GEMINI_API_KEY is not set in environment variables.');
}
