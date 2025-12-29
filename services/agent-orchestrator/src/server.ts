import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { ProviderFactory } from './providers/factory';
import { config } from './config';

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Initialize the AI provider based on environment config
const aiProvider = ProviderFactory.createFromEnv();

app.post('/api/v1/agent/research', async (req, res) => {
    const { businessName, location, mode, language = 'vi' } = req.body;

    if (!businessName) {
        return res.status(400).json({ error: 'businessName is required' });
    }

    const langInstruction = (language === 'vi' ? 'Answer in Vietnamese.' : 'Answer in English.') +
        ' Format your response as HTML (no markdown backticks). Use <table> for structured data with a "STT" (No.) column. Include a small Google Maps iframe (width="200" height="150") for each location in the table using src="https://maps.google.com/maps?q=...&output=embed". Do not use <html> or <body> tags.';

    // Build the query
    let query = `Analyze the business "${businessName}"${location ? ` located in ${location}` : ''}. Find digital gaps and meaningful insights. ${langInstruction}`;

    // Custom prompt for Real Estate mode
    let contextData = '';
    let fetchedData = null;

    if (mode === 'real-estate') {
        const ax = require('axios'); // Dynamic import
        query = `Analyze the land parcel or location related to "${businessName}"${location ? ` in ${location}` : ''}. \n` +
            `If the query contains Sheet/Parcel numbers (So To/So Thua), use the search_real_estate tool to identify the property. \n` +
            `Provide details on Area, Planning (Quy Hoach), and Legal status. ${langInstruction}`;

        try {
            const realEstateUrl = process.env.REAL_ESTATE_SERVICE_URL || 'http://localhost:8002';
            console.log(`🏘️  Fetching real estate data for: ${businessName}`);
            const response = await ax.get(`${realEstateUrl}/api/search-parcels`, {
                params: { q: businessName }
            });

            if (response.data?.count > 0) {
                fetchedData = response.data.data;
                const limitedData = fetchedData.slice(0, 5);

                contextData = `\n\n---\nI have already retrieved the property data for you. Here are ${limitedData.length} of ${response.data.count} matching parcels:\n\n`;

                limitedData.forEach((parcel: any, idx: number) => {
                    contextData += `\n**Property ${idx + 1}:**\n`;
                    contextData += `- Sheet (Số Tờ): ${parcel.so_to}\n`;
                    contextData += `- Parcel (Số Thửa): ${parcel.so_thua}\n`;
                    contextData += `- Location: ${parcel.phuong_xa}, ${parcel.quan_huyen}\n`;
                    contextData += `- Area: ${parcel.dien_tich_m2} m²\n`;
                    contextData += `- Planning: ${parcel.quy_hoach_su_dung_dat || 'N/A'}\n`;
                    if (parcel.google_maps_link) {
                        contextData += `- [View on Google Maps](${parcel.google_maps_link})\n`;
                    }
                });

                contextData += `\n---\nPlease analyze these properties and provide insights. ${langInstruction}\n\n`;
                console.log(`✅ Found ${response.data.count} parcels`);
            }
        } catch (error: any) {
            console.error('Real Estate API error:', error.message);
        }
    }

    try {
        console.log(`🎯 Processing ${mode || 'general'} research request with ${aiProvider.name}`);

        const summary = await aiProvider.execute(query, mode || 'general', contextData);

        const trace = [{
            type: aiProvider.name.toLowerCase(),
            content: `Used ${aiProvider.name} provider`,
            timestamp: new Date()
        }];

        // Add fetched data to trace
        if (fetchedData) {
            trace.unshift({
                type: 'data_retrieval',
                content: `Retrieved ${fetchedData.length} property records`,
                data: fetchedData.slice(0, 10), // Limit payload size
                timestamp: new Date()
            } as any);
        }

        return res.json({
            status: 'success',
            data: {
                summary,
                provider: aiProvider.name,
                trace
            }
        });

    } catch (error: any) {
        console.error(`❌ ${aiProvider.name} error:`, error);

        if (error.message?.includes('429') || error.message?.includes('quota')) {
            const simulatedResponses: Record<string, string> = language === 'vi' ? {
                'general': `<h3>⚠️ Lưu ý: API AI đang quá tải.</h3><p>Dưới đây là phản hồi mô phỏng:</p><h3>Phân tích doanh nghiệp ${businessName}</h3><ul><li><b>Hiện diện số</b>: Tốt, nhưng cần cải thiện tương tác.</li><li><b>Khoảng trống</b>: Thiếu kênh TikTok.</li><li><b>Khuyến nghị</b>: Tối ưu hóa Google Maps và chạy quảng cáo video.</li></ul>`,
                'real-estate': `<h3>⚠️ Lưu ý: API AI đang quá tải.</h3><p>Dưới đây là phản hồi mô phỏng cho bất động sản: ${businessName}</p><h3>Phân tích Bất Động Sản</h3><table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;"><tr><th>STT</th><th>Tiêu chí</th><th>Chi tiết</th><th>Bản đồ</th></tr><tr><td>1</td><td>Vị trí</td><td>Quận 9, TP.HCM</td><td rowspan="5"><iframe width="200" height="150" frameborder="0" style="border:0" src="https://maps.google.com/maps?q=10.855246,106.794408&output=embed" allowfullscreen></iframe></td></tr><tr><td>2</td><td>Diện tích</td><td>737.6 m²</td></tr><tr><td>3</td><td>Quy hoạch</td><td>Đất khu công nghệ cao</td></tr><tr><td>4</td><td>Pháp lý</td><td>Sổ hồng riêng</td></tr><tr><td>5</td><td>Giá trị</td><td>45-50 triệu/m²</td></tr></table><p><a href="https://www.google.com/maps?q=10.855246,106.794408" target="_blank">Xem Vị Trí trên Google Maps</a></p>`
            } : {
                'general': `<h3>⚠️ Disclaimer: Live AI API is currently rate-limited.</h3><p>Here is a simulated response:</p><h3>Analysis of ${businessName}</h3><ul><li><b>Digital Presence</b>: Strong website traffic, but social media engagement is declining.</li><li><b>Gaps</b>: No TikTok presence despite young demographic target.</li><li><b>Recommendation</b>: Launch a short-form video campaign and optimize GMB listing.</li></ul>`,
                'real-estate': `<h3>⚠️ Disclaimer: Live AI API is currently rate-limited.</h3><p>Here is a simulated response for property: ${businessName}</p><h3>Property Analysis</h3><table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;"><tr><th>No.</th><th>Criterion</th><th>Details</th><th>Map</th></tr><tr><td>1</td><td>Location</td><td>District 9, Ho Chi Minh City</td><td rowspan="5"><iframe width="200" height="150" frameborder="0" style="border:0" src="https://maps.google.com/maps?q=10.855246,106.794408&output=embed" allowfullscreen></iframe></td></tr><tr><td>2</td><td>Area</td><td>737.6 m²</td></tr><tr><td>3</td><td>Planning Status</td><td>Approved for High-Tech Park development</td></tr><tr><td>4</td><td>Legal Status</td><td>Clear title, ready for development</td></tr><tr><td>5</td><td>Market Value</td><td>Estimated VND 45-50 million/m²</td></tr></table><p><a href="https://www.google.com/maps?q=10.855246,106.794408" target="_blank">View Location</a></p>`,
            };

            return res.json({
                status: 'success',
                data: {
                    summary: simulatedResponses[mode] || simulatedResponses['general'],
                    provider: `${aiProvider.name} (Simulated)`,
                    trace: [{
                        type: 'fallback',
                        content: 'Rate limited - using simulated response',
                        timestamp: new Date()
                    }]
                }
            });
        }

        return res.status(500).json({
            error: `${aiProvider.name} execution failed`,
            details: { message: error.message }
        });
    }
});

app.get('/api/v1/provider/status', async (req, res) => {
    const available = await aiProvider.isAvailable();
    res.json({
        provider: aiProvider.name,
        available,
        config: {
            gemini_configured: !!process.env.GEMINI_API_KEY,
            openai_configured: !!process.env.OPENAI_API_KEY,
            lm_studio_enabled: process.env.USE_LM_STUDIO === 'true',
        }
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        provider: aiProvider.name,
        timestamp: new Date(),
    });
});

const PORT = config.port || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Agent Orchestrator listening on port ${PORT}`);
    console.log(`📡 Active AI Provider: ${aiProvider.name}`);
});
