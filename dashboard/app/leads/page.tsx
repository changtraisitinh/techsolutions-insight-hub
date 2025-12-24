'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function LeadsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterQuality, setFilterQuality] = useState('all');

    // Mock leads data
    const leads = [
        { id: 1, name: 'The Coffee House', category: 'Coffee Shop', location: 'Ho Chi Minh City', phone: '+84 28 1234 5678', rating: 4.5, quality: 95, website: 'thecoffeehouse.vn', extracted: '2024-12-24' },
        { id: 2, name: 'Highlands Coffee', category: 'Coffee Shop', location: 'Ho Chi Minh City', phone: '+84 28 2345 6789', rating: 4.3, quality: 90, website: 'highlandscoffee.vn', extracted: '2024-12-24' },
        { id: 3, name: 'Cà Phê Sáng', category: 'Coffee Shop', location: 'Ho Chi Minh City', phone: '+84 28 3456 7890', rating: 4.7, quality: 85, website: '', extracted: '2024-12-24' },
        { id: 4, name: 'Phở 24', category: 'Restaurant', location: 'Hanoi', phone: '+84 24 1234 5678', rating: 4.4, quality: 88, website: 'pho24.vn', extracted: '2024-12-23' },
        { id: 5, name: 'Bún Chả Hà Nội', category: 'Restaurant', location: 'Hanoi', phone: '+84 24 2345 6789', rating: 4.6, quality: 82, website: '', extracted: '2024-12-23' },
    ];

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.location.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesQuality = filterQuality === 'all' ||
            (filterQuality === 'high' && lead.quality >= 85) ||
            (filterQuality === 'medium' && lead.quality >= 70 && lead.quality < 85) ||
            (filterQuality === 'low' && lead.quality < 70);

        return matchesSearch && matchesQuality;
    });

    const handleExport = () => {
        if (filteredLeads.length === 0) return;

        const csv = [
            ['Name', 'Category', 'Location', 'Phone', 'Rating', 'Quality Score', 'Website', 'Date Extracted'].join(','),
            ...filteredLeads.map(lead => [
                lead.name,
                lead.category,
                lead.location,
                lead.phone,
                lead.rating,
                lead.quality,
                lead.website || '',
                lead.extracted
            ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        // Create CSV with UTF-8 BOM for Excel compatibility
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);

        const dateStr = new Date().toISOString().split('T')[0];

        const a = document.createElement('a');
        a.href = url;
        a.download = `exported_leads_${dateStr}.csv`;

        // Re-force the download attribute and append to DOM
        document.body.appendChild(a);

        // Trigger download
        a.click();

        // Use a longer delay to ensure the browser processes the resource before revocation
        setTimeout(() => {
            if (document.body.contains(a)) {
                document.body.removeChild(a);
            }
            window.URL.revokeObjectURL(url);
        }, 2000);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Leads Management</h1>
                    <p className="text-gray-600 mt-2">Browse and manage all extracted leads</p>
                </div>
                <button
                    onClick={handleExport}
                    className="btn-primary flex items-center gap-2"
                >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    Export All
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card">
                    <p className="text-sm text-gray-600">Total Leads</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{leads.length}</p>
                </div>
                <div className="card">
                    <p className="text-sm text-gray-600">With Phone</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{leads.filter(l => l.phone).length}</p>
                </div>
                <div className="card">
                    <p className="text-sm text-gray-600">With Website</p>
                    <p className="text-3xl font-bold text-blue-600 mt-1">{leads.filter(l => l.website).length}</p>
                </div>
                <div className="card">
                    <p className="text-sm text-gray-600">Avg Quality</p>
                    <p className="text-3xl font-bold text-purple-600 mt-1">88</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search leads by name, category, or location..."
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <select
                            value={filterQuality}
                            onChange={(e) => setFilterQuality(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Quality</option>
                            <option value="high">High (85+)</option>
                            <option value="medium">Medium (70-84)</option>
                            <option value="low">Low (&lt;70)</option>
                        </select>

                        <button className="btn-secondary flex items-center gap-2">
                            <FunnelIcon className="w-5 h-5" />
                            More Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Leads Table */}
            <div className="card">
                <div className="mb-4">
                    <p className="text-sm text-gray-600">
                        Showing <span className="font-semibold text-gray-900">{filteredLeads.length}</span> of <span className="font-semibold text-gray-900">{leads.length}</span> leads
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Business Name</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Category</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Location</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Phone</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Rating</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Quality</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Website</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeads.map((lead) => (
                                <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                                            <p className="text-xs text-gray-500">Added {lead.extracted}</p>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-600">{lead.category}</td>
                                    <td className="py-3 px-4 text-sm text-gray-600">{lead.location}</td>
                                    <td className="py-3 px-4 text-sm text-gray-600">{lead.phone}</td>
                                    <td className="py-3 px-4 text-sm">
                                        <span className="flex items-center gap-1 text-yellow-600">
                                            ⭐ {lead.rating}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${lead.quality >= 85 ? 'bg-green-100 text-green-700' :
                                            lead.quality >= 70 ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {lead.quality}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm">
                                        {lead.website ? (
                                            <a href={`https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                {lead.website}
                                            </a>
                                        ) : (
                                            <span className="text-gray-400">No website</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
