'use client';

import { useState } from 'react';
import { MapPinIcon, MagnifyingGlassIcon, ArrowDownTrayIcon, PlayIcon } from '@heroicons/react/24/outline';

export default function ExtractPage() {
    const [location, setLocation] = useState('');
    const [keyword, setKeyword] = useState('');
    const [maxResults, setMaxResults] = useState(100);
    const [isExtracting, setIsExtracting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<any[]>([]);

    const handleExtract = async () => {
        if (!location || !keyword) {
            alert('Please enter both location and keyword');
            return;
        }

        setIsExtracting(true);
        setProgress(0);
        setResults([]);

        // Simulate progress updates
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) return 90;
                return prev + 5;
            });
        }, 2000);

        try {
            // Call Maps Intelligence API
            const response = await fetch('http://localhost:8001/api/extract', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    location,
                    keyword,
                    max_results: maxResults,
                    method: 'scraping' // Using web scraping method (free)
                })
            });

            clearInterval(progressInterval);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Extraction failed');
            }

            const data = await response.json();

            // Update results
            setResults(data.leads || []);
            setProgress(100);

            // Show success message
            alert(`✅ Successfully extracted ${data.leads_count} leads in ${data.execution_time.toFixed(1)}s!`);

        } catch (error: any) {
            clearInterval(progressInterval);
            setProgress(0);

            console.error('Extraction error:', error);

            // User-friendly error message
            if (error.message.includes('fetch')) {
                alert('❌ Cannot connect to API. Make sure the Maps Intelligence service is running on port 8001.\n\nStart it with: cd services/maps-intelligence && ./start_api.sh');
            } else {
                alert(`❌ Extraction failed: ${error.message}`);
            }
        } finally {
            setIsExtracting(false);
        }
    };
    const presets = [
        { location: 'Ho Chi Minh City', keyword: 'coffee shop' },
        { location: 'Hanoi', keyword: 'restaurant' },
        { location: 'Da Nang', keyword: 'hotel' },
        { location: 'Ho Chi Minh City', keyword: 'spa' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Extract Leads from Google Maps</h1>
                <p className="text-gray-600 mt-2">Search for businesses and extract contact information automatically</p>
            </div>

            {/* Extraction Form */}
            <div className="card">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <MapPinIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">New Extraction</h2>
                        <p className="text-sm text-gray-600">Configure your search parameters</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location (Province/City)
                        </label>
                        <select
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="input"
                        >
                            <option value="">-- Select Province/City --</option>
                            <option value="Ho Chi Minh City">Ho Chi Minh City</option>
                            <option value="Hanoi">Hanoi</option>
                            <option value="Da Nang">Da Nang</option>
                            <option value="Can Tho">Can Tho</option>
                            <option value="Hai Phong">Hai Phong</option>
                            <option value="An Giang">An Giang</option>
                            <option value="Ba Ria - Vung Tau">Ba Ria - Vung Tau</option>
                            <option value="Bac Giang">Bac Giang</option>
                            <option value="Bac Kan">Bac Kan</option>
                            <option value="Bac Lieu">Bac Lieu</option>
                            <option value="Bac Ninh">Bac Ninh</option>
                            <option value="Ben Tre">Ben Tre</option>
                            <option value="Binh Dinh">Binh Dinh</option>
                            <option value="Binh Duong">Binh Duong</option>
                            <option value="Binh Phuoc">Binh Phuoc</option>
                            <option value="Binh Thuan">Binh Thuan</option>
                            <option value="Ca Mau">Ca Mau</option>
                            <option value="Cao Bang">Cao Bang</option>
                            <option value="Dak Lak">Dak Lak</option>
                            <option value="Dak Nong">Dak Nong</option>
                            <option value="Dien Bien">Dien Bien</option>
                            <option value="Dong Nai">Dong Nai</option>
                            <option value="Dong Thap">Dong Thap</option>
                            <option value="Gia Lai">Gia Lai</option>
                            <option value="Ha Giang">Ha Giang</option>
                            <option value="Ha Nam">Ha Nam</option>
                            <option value="Ha Tinh">Ha Tinh</option>
                            <option value="Hai Duong">Hai Duong</option>
                            <option value="Hau Giang">Hau Giang</option>
                            <option value="Hoa Binh">Hoa Binh</option>
                            <option value="Hung Yen">Hung Yen</option>
                            <option value="Khanh Hoa">Khanh Hoa</option>
                            <option value="Kien Giang">Kien Giang</option>
                            <option value="Kon Tum">Kon Tum</option>
                            <option value="Lai Chau">Lai Chau</option>
                            <option value="Lam Dong">Lam Dong</option>
                            <option value="Lang Son">Lang Son</option>
                            <option value="Lao Cai">Lao Cai</option>
                            <option value="Long An">Long An</option>
                            <option value="Nam Dinh">Nam Dinh</option>
                            <option value="Nghe An">Nghe An</option>
                            <option value="Ninh Binh">Ninh Binh</option>
                            <option value="Ninh Thuan">Ninh Thuan</option>
                            <option value="Phu Tho">Phu Tho</option>
                            <option value="Phu Yen">Phu Yen</option>
                            <option value="Quang Binh">Quang Binh</option>
                            <option value="Quang Nam">Quang Nam</option>
                            <option value="Quang Ngai">Quang Ngai</option>
                            <option value="Quang Ninh">Quang Ninh</option>
                            <option value="Quang Tri">Quang Tri</option>
                            <option value="Soc Trang">Soc Trang</option>
                            <option value="Son La">Son La</option>
                            <option value="Tay Ninh">Tay Ninh</option>
                            <option value="Thai Binh">Thai Binh</option>
                            <option value="Thai Nguyen">Thai Nguyen</option>
                            <option value="Thanh Hoa">Thanh Hoa</option>
                            <option value="Thua Thien Hue">Thua Thien Hue</option>
                            <option value="Tien Giang">Tien Giang</option>
                            <option value="Tra Vinh">Tra Vinh</option>
                            <option value="Tuyen Quang">Tuyen Quang</option>
                            <option value="Vinh Long">Vinh Long</option>
                            <option value="Vinh Phuc">Vinh Phuc</option>
                            <option value="Yen Bai">Yen Bai</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Select a province or city in Vietnam</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Type / Keyword
                        </label>
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="e.g., coffee shop, restaurant"
                            className="input"
                        />
                        <p className="text-xs text-gray-500 mt-1">Type of business to search for</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Maximum Results
                        </label>
                        <select
                            value={maxResults}
                            onChange={(e) => setMaxResults(Number(e.target.value))}
                            className="input"
                        >   <option value={10}>10 leads</option>
                            <option value={50}>50 leads</option>
                            <option value={100}>100 leads</option>
                            <option value={200}>200 leads</option>
                            <option value={500}>500 leads</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Method
                        </label>
                        <select className="input">
                            <option value="scraping">Web Scraping (Free)</option>
                            <option value="api">Google API (Faster, requires key)</option>
                        </select>
                    </div>
                </div>

                {/* Quick Presets */}
                <div className="mt-6">
                    <p className="text-sm font-medium text-gray-700 mb-3">Quick Presets:</p>
                    <div className="flex flex-wrap gap-2">
                        {presets.map((preset, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setLocation(preset.location);
                                    setKeyword(preset.keyword);
                                }}
                                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                {preset.keyword} in {preset.location}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Extract Button */}
                <div className="mt-6 flex gap-3">
                    <button
                        onClick={handleExtract}
                        disabled={!location || !keyword || isExtracting}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExtracting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Extracting...</span>
                            </>
                        ) : (
                            <>
                                <PlayIcon className="w-5 h-5" />
                                <span>Start Extraction</span>
                            </>
                        )}
                    </button>

                    {results.length > 0 && (
                        <button className="btn-secondary flex items-center gap-2">
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            <span>Export to CSV</span>
                        </button>
                    )}
                </div>

                {/* Progress Bar */}
                {isExtracting && (
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Extraction Progress</span>
                            <span className="text-sm text-gray-600">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            {progress < 30 && 'Searching Google Maps...'}
                            {progress >= 30 && progress < 60 && 'Loading results...'}
                            {progress >= 60 && progress < 90 && 'Extracting business details...'}
                            {progress >= 90 && 'Almost done...'}
                        </p>
                    </div>
                )}
            </div>

            {/* Results */}
            {results.length > 0 && (
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Extraction Results</h2>
                            <p className="text-sm text-gray-600 mt-1">{results.length} leads found</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Average Quality Score</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {results.length > 0
                                        ? (results.reduce((sum, lead) => sum + (lead.quality_score || 0), 0) / results.length).toFixed(1)
                                        : '0'}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    // Simple CSV export
                                    const csv = [
                                        ['Name', 'Category', 'Address', 'Phone', 'Website', 'Rating', 'Reviews', 'Quality Score'].join(','),
                                        ...results.map(lead => [
                                            lead.name,
                                            lead.category || '',
                                            lead.address || '',
                                            lead.phone || '',
                                            lead.website || '',
                                            lead.rating || '',
                                            lead.review_count || '',
                                            lead.quality_score || ''
                                        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')) // Wrap fields in quotes and escape existing quotes
                                    ].join('\n');

                                    const blob = new Blob([csv], { type: 'text/csv' });
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `leads-${keyword}-${location}-${new Date().toISOString().split('T')[0]}.csv`;
                                    a.click();
                                }}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <ArrowDownTrayIcon className="w-5 h-5" />
                                Export CSV
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Category</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Rating</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Phone</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Website</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Address</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Quality</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((lead, idx) => (
                                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                                            {lead.review_count && lead.review_count > 0 && (
                                                <div className="text-xs text-gray-500">{lead.review_count} reviews</div>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{lead.category || '-'}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {lead.rating ? (
                                                <span className="flex items-center gap-1 text-yellow-600">
                                                    ⭐ {lead.rating}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{lead.phone || '-'}</td>
                                        <td className="py-3 px-4 text-sm">
                                            {lead.website ? (
                                                <a
                                                    href={lead.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline truncate block max-w-[200px]"
                                                >
                                                    {lead.website.replace(/^https?:\/\//, '')}
                                                </a>
                                            ) : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600 max-w-[250px] truncate">
                                            {lead.address || '-'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${(lead.quality_score || 0) >= 85 ? 'bg-green-100 text-green-700' :
                                                (lead.quality_score || 0) >= 70 ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {lead.quality_score || 0}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="card bg-blue-50 border-blue-200">
                <div className="flex gap-4">
                    <div className="flex-shrink-0">
                        <MagnifyingGlassIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">How it works</h3>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li>• <strong>Web Scraping:</strong> FREE - Uses browser automation (3-5 min for 100 leads)</li>
                            <li>• <strong>Google API:</strong> Faster but requires API key (~$1.70 per 100 leads)</li>
                            <li>• Best results: Use specific keywords like "coffee shop" not "business"</li>
                            <li>• More targeted locations work better: "District 1, HCMC" vs "Vietnam"</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
