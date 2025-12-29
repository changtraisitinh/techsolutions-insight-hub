import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5433/ttqh';

const pool = new Pool({
    connectionString,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export const checkConnection = async () => {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('✅ Connected to Real Estate DB (ttqh) at localhost:5433');
        return true;
    } catch (err) {
        console.error('❌ Database connection failed', err);
        return false;
    }
};
