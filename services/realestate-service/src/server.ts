import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { checkConnection, query } from './db';

dotenv.config();

const app = express();
const port = process.env.PORT || 8002;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Real Estate Analysis Service is running' });
});

// Helper to remove Vietnamese accents for comparison
function removeAccents(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

app.get('/api/search-parcels', async (req, res) => {
    const { q } = req.query;
    let textSearch = (q as string) || '';

    // Parse natural language query
    let soto = null;
    let sothua = null;

    // Extract Sheet number (To/So To)
    const sotoMatch = textSearch.match(/(?:tờ|to|so to|số tờ)[:\s]*(\d+)/i);
    if (sotoMatch) {
        soto = sotoMatch[1];
        textSearch = textSearch.replace(sotoMatch[0], '');
    }

    // Extract Parcel number (Thua/So Thua)
    const sothuaMatch = textSearch.match(/(?:thửa|thua|so thua|số thửa)[:\s]*(\d+)/i);
    if (sothuaMatch) {
        sothua = sothuaMatch[1];
        textSearch = textSearch.replace(sothuaMatch[0], '');
    }

    // Clean up remaining text
    textSearch = textSearch.replace(/[,;]/g, ' ').trim().replace(/\s+/g, ' ');
    const normalizedSearch = removeAccents(textSearch);

    console.log(`Parsed -> Soto: ${soto}, Sothua: ${sothua}, Text: "${textSearch}"`);

    let sql = `
      SELECT
        id,
        thongtinchung->>'mathuadat' AS ma_thua_dat,
        thongtinchung->>'soto' AS so_to,
        thongtinchung->>'sothua' AS so_thua,
        (thongtinchung->>'dientich')::numeric AS dien_tich_m2,
        LEFT(thongtinchung->>'mathuadat', 5) AS maphuongxa,
        thongtinchung->>'tenphuongxa' AS phuong_xa,
        thongtinchung->>'tenquanhuyen' AS quan_huyen,
        (thongtinchung->'dsttdoan'->0)->>'soqd' AS so_quyet_duyet,
        (thongtinchung->'dsttdoan'->0)->>'tendoan' AS ten_do_an,
        (thongtinchung->'dsttdoan'->0)->>'ngayduyet' AS ngay_duyet,
        (thongtinchung->'dsttdoan'->0)->>'coquanpd' AS co_quan_phe_duyet,
        (logioi#>>'{0,properties,tenduong}') AS ten_duong_1,
        (logioi#>>'{0,properties,huongtiepgiap}') AS huong_1,
        (logioi#>>'{1,properties,tenduong}') AS ten_duong_2,
        (logioi#>>'{1,properties,huongtiepgiap}') AS huong_2,
        'https://www.google.com/maps?q=' ||
        ((thongtinchung->>'marker')::jsonb->'coordinates'->>1)::numeric || ',' ||
        ((thongtinchung->>'marker')::jsonb->'coordinates'->>0)::numeric AS google_maps_link
      FROM public.ttqh_chi_tiet
    `;

    try {
        let results;

        // STRATEGY 1: Exact Sheet/Parcel Match (High Confidence) + JS Filter
        if (soto && sothua) {
            console.log("⚡ Executing Strategy 1: Exact ID Lookup");
            const idSql = sql + ` WHERE thongtinchung->>'soto' = $1 AND thongtinchung->>'sothua' = $2`;
            const dbRes = await query(idSql, [soto, sothua]);

            // Client-side fuzzy filtering
            if (textSearch.length > 0) {
                results = dbRes.rows.filter((row: any) => {
                    // Convert entire row to text and check fuzzy match
                    const rowText = removeAccents(JSON.stringify(row));
                    return rowText.includes(normalizedSearch);
                });
                // If filtering removes everything, but we had ID matches, return them as fallback
                if (results.length === 0 && dbRes.rows.length > 0) {
                    console.log("⚠️ Text filter removed all ID matches. Returning original ID matches as best guess.");
                    results = dbRes.rows;
                }
            } else {
                results = dbRes.rows;
            }
        }
        // STRATEGY 2: Text Search (Fallback)
        else {
            console.log("⚡ Executing Strategy 2: Broad Text Search");
            let whereParams = [];
            let whereClauses = [];

            if (soto) {
                whereClauses.push(`thongtinchung->>'soto' = $${whereParams.length + 1}`);
                whereParams.push(soto);
            }
            if (sothua) {
                whereClauses.push(`thongtinchung->>'sothua' = $${whereParams.length + 1}`);
                whereParams.push(sothua);
            }
            if (textSearch) {
                whereClauses.push(`(thongtinchung::text ILIKE $${whereParams.length + 1} OR logioi::text ILIKE $${whereParams.length + 1})`);
                whereParams.push(`%${textSearch}%`);
            }

            if (whereClauses.length > 0) {
                sql += ' WHERE ' + whereClauses.join(' AND ');
            }
            sql += ' LIMIT 50';

            const dbRes = await query(sql, whereParams);
            results = dbRes.rows;
        }

        res.json({
            status: 'success',
            count: results ? results.length : 0,
            data: results || []
        });

    } catch (err: any) {
        console.error('Search failed:', err);
        res.status(500).json({ error: 'Database query failed', details: err.message });
    }
});

app.get('/health', async (req, res) => {
    const dbStatus = await checkConnection();
    res.json({
        status: 'ok',
        timestamp: new Date(),
        database: dbStatus ? 'connected' : 'disconnected'
    });
});

app.listen(port, async () => {
    console.log(`🚀 Real Estate Service listening on port ${port}`);
    await checkConnection();
});
