'use client';

import { useState, useEffect } from 'react';
import { MapPinIcon, MagnifyingGlassIcon, ArrowDownTrayIcon, PlayIcon, ClockIcon, UsersIcon, UserPlusIcon, CheckIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

export default function ExtractPage() {
    const API_BASE_URL = process.env.NEXT_PUBLIC_MAPS_API_URL || 'http://127.0.0.1:8001';

    const formatPhoneNumber = (phone: any) => {
        if (!phone) return '';
        let clean = String(phone).replace(/\s+/g, '');
        if (clean.startsWith('+84')) {
            clean = '0' + clean.slice(3);
        }
        return clean;
    };

    const cleanText = (text: any) => {
        if (!text) return '';
        return String(text).replace(/[]/g, '').replace(/^(Address:|Địa chỉ:)\s*/i, '').trim();
    };

    const [location, setLocation] = useState('');
    const [keyword, setKeyword] = useState('');
    const [maxResults, setMaxResults] = useState(100);
    const [isExtracting, setIsExtracting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<any[]>([]);
    const [lastJobId, setLastJobId] = useState<string | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [detectedAddress, setDetectedAddress] = useState<string | null>(null);
    const [isDetecting, setIsDetecting] = useState(false);

    const fetchHistory = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs`);
            if (response.ok) {
                const data = await response.json();
                setHistory(data);
            }
        } catch (error) {
            console.error('Failed to fetch history:', error);
        }
    };

    const handleLoadResults = async (jobId: string) => {
        setIsExtracting(true);
        setProgress(100);
        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/results`);
            if (response.ok) {
                const data = await response.json();
                setResults(data.leads || []);
                setLastJobId(jobId);
            }
        } catch (error) {
            alert('Failed to load results');
        } finally {
            setIsExtracting(false);
        }
    };

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setIsDetecting(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const coords = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

            try {
                const response = await fetch(`${API_BASE_URL}/api/geolocate?lat=${latitude}&lng=${longitude}`);
                if (response.ok) {
                    const data = await response.json();
                    setDetectedAddress(data.address);
                    // Update location to the province to match dropdown if possible
                    if (data.province) {
                        setLocation(data.province);
                    } else {
                        setLocation(coords);
                    }
                } else {
                    setLocation(coords);
                }
            } catch (error) {
                setLocation(coords);
            } finally {
                setIsDetecting(false);
            }
        }, (error) => {
            setIsDetecting(false);
            alert(`Geolocation error: ${error.message}`);
        });
    };

    // Fetch history on mount
    useEffect(() => {
        fetchHistory();
    }, []);

    const handleExport = () => {
        if (results.length === 0) return;

        // Simple CSV export
        const csv = [
            ['Name', 'Category', 'Address', 'Phone', 'Website', 'Google Maps Link', 'Rating', 'Reviews', 'Quality Score'].join(','),
            ...results.map(lead => [
                cleanText(lead.name),
                cleanText(lead.category) || '',
                cleanText(lead.address) || '',
                formatPhoneNumber(lead.phone),
                lead.website || '',
                lead.google_maps_url || '',
                lead.rating || '',
                lead.review_count || '',
                lead.quality_score || ''
            ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')) // Wrap fields in quotes and escape existing quotes
        ].join('\n');

        // Create CSV with UTF-8 BOM for Excel compatibility with Vietnamese characters
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);

        // Final fallback for sanitization
        const safeKeyword = (keyword || 'leads').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const safeLocation = (location || 'area').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const dateStr = new Date().toISOString().split('T')[0];

        const a = document.createElement('a');
        a.href = url;
        a.download = `leads_${safeKeyword}_${safeLocation}_${dateStr}.csv`;

        // Re-force the download attribute and append to DOM
        document.body.appendChild(a);

        // Trigger download
        a.click();

        // Important: Increase delay to 2 seconds to allow slower systems/browsers to process the blob
        setTimeout(() => {
            if (document.body.contains(a)) {
                document.body.removeChild(a);
            }
            window.URL.revokeObjectURL(url);
        }, 2000);
    };

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
            const response = await fetch(`${API_BASE_URL}/api/extract`, {
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
            setLastJobId(data.job_id);
            setProgress(100);

            // Refresh history
            fetchHistory();

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

    const handleSaveLead = async (leadId: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/leads/${leadId}/save`, {
                method: 'POST',
            });
            if (response.ok) {
                // Update local status
                setResults(prev => prev.map(l => l.id === leadId ? { ...l, is_saved: true } : l));
            }
        } catch (error) {
            console.error('Failed to save lead:', error);
        }
    };

    const handleConvertToLeads = async () => {
        if (!lastJobId) return;

        if (!confirm(`Are you sure you want to convert all ${results.length} results into managed leads?`)) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs/${lastJobId}/convert`, {
                method: 'POST',
            });
            if (response.ok) {
                alert('Success! All results have been promoted to your Leads list.');
                setResults(prev => prev.map(l => ({ ...l, is_saved: true })));
            }
        } catch (error) {
            alert('Failed to convert leads');
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
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Location (Province/City)
                            </label>
                            <button
                                onClick={handleDetectLocation}
                                disabled={isDetecting}
                                className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 disabled:opacity-50"
                            >
                                <MapPinIcon className={`w-3 h-3 ${isDetecting ? 'animate-pulse' : ''}`} />
                                {isDetecting ? 'Detecting...' : 'Detect Near By Me'}
                            </button>
                        </div>
                        <select
                            value={location.includes(',') || (detectedAddress && location) ? location : location}
                            onChange={(e) => {
                                setLocation(e.target.value);
                                if (detectedAddress) setDetectedAddress(null); // Clear address if they manually change
                            }}
                            className="input"
                        >
                            <option value="">-- Select Province/City --</option>
                            <option value="nearby" hidden>📍 Near by me (Current Location)</option>
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
                        {(location.includes(',') || detectedAddress) && (
                            <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-top-1">
                                <p className="text-xs text-blue-700 font-bold flex items-center gap-1">
                                    <MapPinIcon className="w-3 h-3" />
                                    Location Identified
                                </p>
                                {detectedAddress && (
                                    <p className="text-xs text-gray-700 mt-1 italic leading-relaxed">
                                        {detectedAddress}
                                    </p>
                                )}
                                <p className="text-[10px] text-blue-500 mt-1 font-mono">
                                    Coords: {location.includes(',') ? location : 'Using profile center'}
                                </p>
                            </div>
                        )}
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
                            <option value="scraping">Web Scraping</option>
                            <option value="api">Google API</option>
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
                        <button
                            onClick={handleExport}
                            className="btn-secondary flex items-center gap-2"
                        >
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
                                onClick={handleConvertToLeads}
                                className="btn-primary flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                            >
                                <UsersIcon className="w-5 h-5" />
                                Convert All to Leads
                            </button>
                            <button
                                onClick={handleExport}
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
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((lead, idx) => (
                                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{lead.category || '-'}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {lead.rating ? (
                                                <span className="flex items-center gap-1 text-yellow-600">
                                                    ⭐ {lead.rating}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{formatPhoneNumber(lead.phone) || '-'}</td>
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
                                        <td className="py-3 px-4 text-sm text-gray-600 max-w-[250px] truncate" title={cleanText(lead.address)}>
                                            {cleanText(lead.address) || '-'}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {lead.google_maps_url && (
                                                    <a
                                                        href={lead.google_maps_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg w-8 h-8 transition-colors"
                                                        title="View on Google Maps"
                                                    >
                                                        <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                                                    </a>
                                                )}
                                                {lead.is_saved ? (
                                                    <div className="flex items-center justify-center text-green-600 bg-green-50 rounded-full w-8 h-8" title="Already Saved">
                                                        <CheckIcon className="w-5 h-5" />
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleSaveLead(lead.id)}
                                                        className="flex items-center justify-center text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-200 rounded-full w-8 h-8 transition-all duration-200"
                                                        title="Add to Leads"
                                                    >
                                                        <UserPlusIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Recent Extractions History */}
            <div className="card">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-50 rounded-lg">
                        <ClockIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Recent Extractions</h2>
                        <p className="text-sm text-gray-600">History of your past search results</p>
                    </div>
                </div>

                {history.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Job Id</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Keyword</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Location</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Run Date</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Leads</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((job) => (
                                    <tr key={job.job_id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm font-mono text-gray-500">
                                            {job.job_id.split('-')[0]}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                                            {job.keyword}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {job.location}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {job.created_at ? new Date(job.created_at).toLocaleString() : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                            {job.leads_count} leads
                                        </td>
                                        <td className="py-3 px-4 text-sm">
                                            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${job.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                job.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <button
                                                onClick={() => handleLoadResults(job.job_id)}
                                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                            >
                                                View Results
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 text-center py-6">No search history found</p>
                )}
            </div>

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
