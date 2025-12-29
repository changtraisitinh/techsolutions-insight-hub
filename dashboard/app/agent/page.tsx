'use client';

import { useState } from 'react';
import {
    SparklesIcon,
    MagnifyingGlassIcon,
    ChatBubbleBottomCenterIcon,
    PaperAirplaneIcon
} from '@heroicons/react/24/outline';


const LANGUAGES = [
    { id: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { id: 'en', label: 'English', flag: '🇺🇸' }
];

const TEXTS = {
    vi: {
        title: "Trợ Lý Nghiên Cứu",
        subtitle: "Phân tích chuyên sâu được hỗ trợ bởi AI",
        readyTitle: "Sẵn Sàng Nghiên Cứu",
        readySub: "Nhập tên doanh nghiệp, địa điểm hoặc thông tin bất động sản để phân tích.",
        analyze: "Phân Tích",
        placeholderBase: "Nhập thông tin...",
        dataSource: "Nguồn Dữ Liệu"
    },
    en: {
        title: "Agent Research",
        subtitle: "Deep dive analysis powered by AI",
        readyTitle: "Ready to Research",
        readySub: "Enter a business name, location, or property details to analyze.",
        analyze: "Analyze",
        placeholderBase: "Enter information...",
        dataSource: "Data Source"
    }
};

const RESEARCH_MODES = {
    vi: [
        { id: 'general', label: 'Tổng Quát' },
        { id: 'real-estate', label: 'Bất Động Sản' },
        { id: 'marketing', label: 'Tiếp Thị' },
        { id: 'competitor', label: 'Đối Thủ' },
        { id: 'leads', label: 'Khách Hàng' }
    ],
    en: [
        { id: 'general', label: 'General Research' },
        { id: 'real-estate', label: 'Real Estate' },
        { id: 'marketing', label: 'Marketing' },
        { id: 'competitor', label: 'Competitor Analysis' },
        { id: 'leads', label: 'Lead Generation' }
    ]
};

const MODE_PLACEHOLDERS = {
    vi: {
        'general': 'Nhập tên doanh nghiệp (vd: Highlands Coffee)',
        'real-estate': 'Nhập thông tin BĐS (vd: số tờ 57, số thửa 8, phường tân phú)',
        'marketing': 'Nhập tên doanh nghiệp để phân tích tiếp thị',
        'competitor': 'Nhập tên doanh nghiệp để phân tích đối thủ',
        'leads': 'Nhập ngành nghề hoặc địa điểm để tìm khách hàng'
    },
    en: {
        'general': 'Enter business name (e.g. Highlands Coffee)',
        'real-estate': 'Enter property details (e.g. so to 57, so thua 8, phuong tan phu)',
        'marketing': 'Enter business name for marketing analysis',
        'competitor': 'Enter business name for competitor analysis',
        'leads': 'Enter industry or location to find leads'
    }
};

const MODE_SUGGESTIONS = {
    vi: {
        'general': [
            "Phân tích Highlands Coffee tại Quận 1",
            "Tìm khoảng trống số hóa cho Phúc Long",
            "Nghiên cứu chuỗi cà phê mới nổi ở Đà Nẵng"
        ],
        'real-estate': [
            "số tờ 57, số thửa 8, phường tân phú",
            "lô đất quận 1 nguyễn huệ",
            "thông tin quy hoạch bình thạnh"
        ],
        'marketing': [
            "Chiến lược tiếp thị cho quán cà phê",
            "Phân tích hiện diện mạng xã hội",
            "Cơ hội tương tác khách hàng"
        ],
        'competitor': [
            "So sánh Highlands vs Starbucks",
            "Phân tích đối thủ trà sữa",
            "Định vị thị trường nhà hàng"
        ],
        'leads': [
            "Quán cà phê chưa có website ở TP.HCM",
            "Nhà hàng mới mở tại Quận 7",
            "Cửa hàng bán lẻ cần hiện diện số"
        ]
    },
    en: {
        'general': [
            "Analyze Highlands Coffee in District 1",
            "Find digital gaps for Phuc Long Tea in Hanoi",
            "Research emerging coffee chains in Da Nang"
        ],
        'real-estate': [
            "so to 57, so thua 8, phuong tan phu",
            "land parcel district 1 nguyen hue",
            "property planning information binh thanh"
        ],
        'marketing': [
            "Marketing strategy for coffee shop brand",
            "Social media presence analysis",
            "Customer engagement opportunities"
        ],
        'competitor': [
            "Compare Highlands vs Starbucks",
            "Analyze tea shop competitors",
            "Restaurant market positioning"
        ],
        'leads': [
            "Coffee shops without websites in HCMC",
            "New restaurants in District 7",
            "Retail stores needing digital presence"
        ]
    }
};

export default function AgentPage() {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [selectedMode, setSelectedMode] = useState('general');
    const [lang, setLang] = useState<'vi' | 'en'>('vi');

    const t = TEXTS[lang];

    const handleResearch = async () => {
        if (!query.trim()) return;

        setIsLoading(true);
        setError('');

        // Optimistically add user message
        setMessages(prev => [...prev, { role: 'user', content: query }]);

        try {
            const agentApiUrl = process.env.NEXT_PUBLIC_AGENT_SERVICE_URL || 'http://localhost:8080';
            const response = await fetch(`${agentApiUrl}/api/v1/agent/research`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    businessName: query,
                    location: 'Vietnam',
                    mode: selectedMode,
                    language: lang,
                    apiKey: localStorage.getItem('gemini_api_key') || undefined
                }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                setMessages(prev => [...prev, {
                    role: 'agent',
                    content: data.data.summary || "No insights found.",
                    trace: data.data.trace
                }]);
            } else {
                if (data.details?.code === '429') {
                    const simulatedResponses: Record<string, string> = lang === 'vi' ? {
                        'general': `<h3>⚠️ Lưu ý: API đang bị giới hạn lượt gọi.</h3><p>Dưới đây là phản hồi mô phỏng:</p><h3>Phân tích ${query}</h3><ul><li><b>Hiện diện số</b>: Lưu lượng truy cập web tốt, nhưng tương tác mạng xã hội đang giảm.</li><li><b>Khoảng trống</b>: Chưa có kênh TikTok dù khách hàng mục tiêu trẻ.</li><li><b>Khuyến nghị</b>: Triển khai chiến dịch video ngắn và tối ưu hóa Google Maps.</li></ul>`,
                        'real-estate': `<h3>⚠️ Lưu ý: API đang bị giới hạn lượt gọi.</h3><p>Dưới đây là phản hồi mô phỏng cho: ${query}</p><h3>Phân tích Bất Động Sản</h3><table border="1" style="width:100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px;"><tr><th style="background:#f3f4f6; text-align:left; padding:8px;">STT</th><th style="background:#f3f4f6; text-align:left; padding:8px;">Tiêu chí</th><th style="background:#f3f4f6; text-align:left; padding:8px;">Chi tiết</th><th style="background:#f3f4f6; text-align:left; padding:8px;">Bản đồ</th></tr><tr><td style="padding:8px;">1</td><td style="padding:8px;">Vị trí</td><td style="padding:8px;">Quận 9, TP.HCM</td><td rowspan="5" style="padding:8px;"><iframe width="200" height="150" frameborder="0" style="border:0" src="https://maps.google.com/maps?q=10.855246,106.794408&output=embed" allowfullscreen></iframe></td></tr><tr><td style="padding:8px;">2</td><td style="padding:8px;">Diện tích</td><td style="padding:8px;">737.6 m²</td></tr><tr><td style="padding:8px;">3</td><td style="padding:8px;">Quy hoạch</td><td style="padding:8px;">Đất khu công nghệ cao</td></tr><tr><td style="padding:8px;">4</td><td style="padding:8px;">Pháp lý</td><td style="padding:8px;">Sổ hồng riêng</td></tr><tr><td style="padding:8px;">5</td><td style="padding:8px;">Giá thị trường</td><td style="padding:8px;">Ước tính 45-50 triệu/m²</td></tr></table><p><a href="https://www.google.com/maps?q=10.855246,106.794408" target="_blank" style="color:blue; text-decoration: underline;">Xem Vị Trí</a></p>`,
                        'marketing': `<h3>⚠️ Lưu ý: API đang bị giới hạn lượt gọi.</h3><p>Dưới đây là phân tích tiếp thị mô phỏng cho: ${query}</p><h3>Phân tích Tiếp Thị</h3><ul><li><b>Định vị</b>: Chuỗi cà phê tầm trung với không gian cao cấp</li><li><b>Mạng xã hội</b>: Facebook (50k theo dõi), Instagram (35k)</li><li><b>Cơ hội</b>: Tận dụng nội dung từ người dùng (UGC)</li><li><b>Chiến lược</b>: Tập trung vào câu chuyện văn hóa cà phê</li><li><b>Khuyến nghị</b>: Ra mắt ứng dụng tích điểm để tăng tỷ lệ quay lại 25%</li></ul>`,
                        'competitor': `<h3>⚠️ Lưu ý: API đang bị giới hạn lượt gọi.</h3><p>Dưới đây là phân tích đối thủ mô phỏng cho: ${query}</p><h3>Bối Cảnh Cạnh Tranh</h3><table border="1" style="width:100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px;"><tr><th style="background:#f3f4f6; padding:8px;">Yếu tố</th><th style="background:#f3f4f6; padding:8px;">Chi tiết</th></tr><tr><td style="padding:8px;">Vị thế</td><td style="padding:8px;">Top 3 thị trường, sau Highlands và Starbucks</td></tr><tr><td style="padding:8px;">Giá cả</td><td style="padding:8px;">Thấp hơn Starbucks 15%, cao hơn chuỗi nhỏ 10%</td></tr><tr><td style="padding:8px;">Điểm mạnh</td><td style="padding:8px;">Thương hiệu địa phương mạnh, khách hàng trung thành</td></tr><tr><td style="padding:8px;">Điểm yếu</td><td style="padding:8px;">Hiện diện số hạn chế, chưa tích hợp giao hàng tốt</td></tr><tr><td style="padding:8px;">Thách thức</td><td style="padding:8px;">Sự mở rộng của các chuỗi cà phê Hàn Quốc</td></tr></table>`,
                        'leads': `<h3>⚠️ Lưu ý: API đang bị giới hạn lượt gọi.</h3><p>Dưới đây là báo cáo tìm kiếm khách hàng mô phỏng cho: ${query}</p><h3>Kết Quả Tìm Kiếm</h3><table border="1" style="width:100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px;"><tr><th style="background:#f3f4f6; padding:8px;">Mục</th><th style="background:#f3f4f6; padding:8px;">Số liệu</th></tr><tr><td style="padding:8px;">Tổng số tìm thấy</td><td style="padding:8px;">47 doanh nghiệp phù hợp</td></tr><tr><td style="padding:8px;">Tiềm năng cao</td><td style="padding:8px;">12 nhà hàng chưa có website</td></tr><tr><td style="padding:8px;">Tiềm năng trung bình</td><td style="padding:8px;">23 website lỗi thời (>3 năm)</td></tr><tr><td style="padding:8px;">Tỷ lệ liên hệ</td><td style="padding:8px;">85% có số điện thoại, 60% có email</td></tr></table><p><b>Bước tiếp theo</b>: Ưu tiên doanh nghiệp đánh giá 4+ sao</p>`
                    } : {
                        'general': `<h3>⚠️ Disclaimer: Live Agent API is currently rate-limited.</h3><p>Here is a simulated response based on your query:</p><h3>Analysis of ${query}</h3><ul><li><b>Digital Presence</b>: Strong website traffic, but social media engagement is declining.</li><li><b>Gaps</b>: No TikTok presence despite young demographic target.</li><li><b>Recommendation</b>: Launch a short-form video campaign and optimize GMB listing.</li></ul>`,
                        'real-estate': `<h3>⚠️ Disclaimer: Live Agent API is currently rate-limited.</h3><p>Here is a simulated response for property: ${query}</p><h3>Property Analysis</h3><table border="1" style="width:100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px;"><tr><th style="background:#f3f4f6; text-align:left; padding:8px;">No.</th><th style="background:#f3f4f6; text-align:left; padding:8px;">Criterion</th><th style="background:#f3f4f6; text-align:left; padding:8px;">Details</th><th style="background:#f3f4f6; text-align:left; padding:8px;">Map</th></tr><tr><td style="padding:8px;">1</td><td style="padding:8px;">Location</td><td style="padding:8px;">District 9, Ho Chi Minh City</td><td rowspan="5" style="padding:8px;"><iframe width="200" height="150" frameborder="0" style="border:0" src="https://maps.google.com/maps?q=10.855246,106.794408&output=embed" allowfullscreen></iframe></td></tr><tr><td style="padding:8px;">2</td><td style="padding:8px;">Area</td><td style="padding:8px;">737.6 m²</td></tr><tr><td style="padding:8px;">3</td><td style="padding:8px;">Planning Status</td><td style="padding:8px;">Approved for High-Tech Park development</td></tr><tr><td style="padding:8px;">4</td><td style="padding:8px;">Legal Status</td><td style="padding:8px;">Clear title, ready for development</td></tr><tr><td style="padding:8px;">5</td><td style="padding:8px;">Market Value</td><td style="padding:8px;">Estimated VND 45-50 million/m²</td></tr></table><p><a href="https://www.google.com/maps?q=10.855246,106.794408" target="_blank" style="color:blue; text-decoration: underline;">View Location</a></p>`,
                        'marketing': `<h3>⚠️ Disclaimer: Live Agent API is currently rate-limited.</h3><p>Here is a simulated marketing analysis for: ${query}</p><h3>Marketing Analysis</h3><ul><li><b>Brand Positioning</b>: Mid-market coffee chain with premium aspirations</li><li><b>Social Media</b>: Facebook (50k followers), Instagram (35k) - good engagement</li><li><b>Opportunities</b>: Leverage user-generated content, influencer partnerships</li><li><b>Content Strategy</b>: Focus on coffee culture, behind-the-scenes stories</li><li><b>Recommendation</b>: Launch a loyalty app to increase retention by 25%</li></ul>`,
                        'competitor': `<h3>⚠️ Disclaimer: Live Agent API is currently rate-limited.</h3><p>Here is a simulated competitor analysis for: ${query}</p><h3>Competitive Landscape</h3><table border="1" style="width:100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px;"><tr><th style="background:#f3f4f6; padding:8px;">Factor</th><th style="background:#f3f4f6; padding:8px;">Details</th></tr><tr><td style="padding:8px;">Market Position</td><td style="padding:8px;">#3 in local market, behind Highlands and Starbucks</td></tr><tr><td style="padding:8px;">Pricing</td><td style="padding:8px;">15% lower than Starbucks, 10% higher than local chains</td></tr><tr><td style="padding:8px;">Strengths</td><td style="padding:8px;">Strong local brand, loyal customer base</td></tr><tr><td style="padding:8px;">Weaknesses</td><td style="padding:8px;">Limited digital presence, no delivery integration</td></tr><tr><td style="padding:8px;">Threat</td><td style="padding:8px;">Aggressive expansion by Korean coffee chains</td></tr></table>`,
                        'leads': `<h3>⚠️ Disclaimer: Live Agent API is currently rate-limited.</h3><p>Here is a simulated lead generation report for: ${query}</p><h3>Lead Generation Results</h3><table border="1" style="width:100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px;"><tr><th style="background:#f3f4f6; padding:8px;">Metric</th><th style="background:#f3f4f6; padding:8px;">Value</th></tr><tr><td style="padding:8px;">Total Prospects</td><td style="padding:8px;">47 businesses matching criteria</td></tr><tr><td style="padding:8px;">High-Priority</td><td style="padding:8px;">12 restaurants with no website</td></tr><tr><td style="padding:8px;">Medium-Priority</td><td style="padding:8px;">23 with outdated websites (>3 years old)</td></tr><tr><td style="padding:8px;">Contact Rate</td><td style="padding:8px;">85% have phone numbers, 60% have emails</td></tr></table><p><b>Next Steps</b>: Prioritize businesses with 4+ stars and 100+ reviews</p>`
                    };

                    setMessages(prev => [...prev, {
                        role: 'agent',
                        content: simulatedResponses[selectedMode] || simulatedResponses['general'],
                        trace: []
                    }]);
                } else {
                    setError(data.details?.message || 'Agent failed to respond.');
                }
            }
        } catch (err) {
            setError('Failed to connect to Agent Orchestrator. Is it running?');
            console.error(err);
        } finally {
            setIsLoading(false);
            setQuery(''); // Clear input? Or keep it?
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6 h-screen flex flex-col">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
                        <p className="text-sm text-gray-500">{t.subtitle}</p>
                    </div>
                </div>

                {/* Language Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {LANGUAGES.map((l) => (
                        <button
                            key={l.id}
                            onClick={() => setLang(l.id as 'vi' | 'en')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${lang === l.id
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <span className="mr-1">{l.flag}</span>
                            {l.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Mode Selection */}
            <div className="flex flex-wrap gap-2">
                {RESEARCH_MODES[lang].map((mode: any) => (
                    <button
                        key={mode.id}
                        onClick={() => setSelectedMode(mode.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${selectedMode === mode.id
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {mode.label}
                    </button>
                ))}
            </div>

            {/* Chat / Results Area */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                            <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">{t.readyTitle}</h3>
                            <p className="text-gray-500 max-w-md">
                                {t.readySub}
                            </p>

                            <div className="mt-8 grid grid-cols-1 gap-3">
                                {MODE_SUGGESTIONS[lang][selectedMode as keyof typeof MODE_SUGGESTIONS['vi']].map((s: string) => (
                                    <button
                                        key={s}
                                        onClick={() => setQuery(s)}
                                        className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'agent' && (
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                        <SparklesIcon className="w-4 h-4 text-indigo-600" />
                                    </div>
                                )}

                                <div className={`p-4 rounded-2xl max-w-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-800'
                                    }`}>
                                    {msg.role === 'agent' ? (
                                        <div
                                            className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-ul:text-gray-800 prose-table:border-collapse prose-table:border prose-th:border prose-td:border prose-th:p-2 prose-td:p-2 prose-th:bg-gray-100"
                                            dangerouslySetInnerHTML={{ __html: msg.content }}
                                        />
                                    ) : (
                                        <div className="whitespace-pre-wrap">
                                            {msg.content}
                                        </div>
                                    )}
                                    {msg.trace && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <p className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                                                <ChatBubbleBottomCenterIcon className="w-3 h-3" />
                                                {t.dataSource}
                                            </p>
                                            <div className="text-xs font-mono text-gray-600 mt-2 space-y-2">
                                                {msg.trace.map((t: any, i: number) => (
                                                    <div key={i}>
                                                        <div className="flex gap-2 items-center mb-1">
                                                            <span className="text-gray-400">[{new Date(t.timestamp).toLocaleTimeString()}]</span>
                                                            <span className="font-semibold text-indigo-600 uppercase">{t.type}</span>
                                                            {t.content && <span>- {t.content}</span>}
                                                        </div>

                                                        {t.type === 'data_retrieval' && t.data && (
                                                            <div className="bg-gray-100 p-2 rounded-lg border border-gray-200 overflow-x-auto max-h-60">
                                                                <pre className="text-[10px] leading-relaxed">
                                                                    {JSON.stringify(t.data, null, 2)}
                                                                </pre>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        <UsersIcon className="w-4 h-4 text-blue-600" />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center animate-pulse">
                                <SparklesIcon className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div className="bg-gray-50 p-4 rounded-2xl">
                                <div className="flex space-x-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                                </div>
                            </div>
                        </div>
                    )}
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                            Error: {error}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
                            placeholder={MODE_PLACEHOLDERS[lang][selectedMode as keyof typeof MODE_PLACEHOLDERS['vi']]}
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleResearch}
                            disabled={isLoading || !query.trim()}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                        >
                            <PaperAirplaneIcon className="w-5 h-5" />
                            <span>{t.analyze}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function UsersIcon(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
    )
}
