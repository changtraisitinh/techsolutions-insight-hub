'use client';
import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, ArrowDownTrayIcon, GlobeAltIcon, PhoneIcon, MapPinIcon, ArrowTopRightOnSquareIcon, EnvelopeIcon, TrashIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function LeadsPage() {
    const API_BASE_URL = process.env.NEXT_PUBLIC_MAPS_API_URL || 'http://127.0.0.1:8001';

    const [leads, setLeads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterQuality, setFilterQuality] = useState('all');

    const fetchLeads = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/leads?saved_only=true`);
            if (response.ok) {
                const data = await response.json();
                setLeads(data);
            }
        } catch (error) {
            console.error('Failed to fetch leads:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const filteredLeads = leads.filter(lead => {
        const matchesSearch =
            (lead.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (lead.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (lead.address || '').toLowerCase().includes(searchQuery.toLowerCase());

        const quality = lead.quality_score || 0;
        const matchesQuality = filterQuality === 'all' ||
            (filterQuality === 'high' && quality >= 85) ||
            (filterQuality === 'medium' && quality >= 70 && quality < 85) ||
            (filterQuality === 'low' && quality < 70);

        return matchesSearch && matchesQuality;
    });

    const handleStatusChange = async (leadId: number, newStatus: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/leads/${leadId}/status?status=${newStatus}`, {
                method: 'POST',
            });
            if (response.ok) {
                setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const handleDeleteLead = async (leadId: number) => {
        if (!confirm('Are you sure you want to delete this lead? This action cannot be undone.')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/leads/${leadId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setLeads(prev => prev.filter(l => l.id !== leadId));
            }
        } catch (error) {
            console.error('Failed to delete lead:', error);
        }
    };

    const handleExport = () => {
        if (filteredLeads.length === 0) return;

        const csv = [
            ['Name', 'Category', 'Address', 'Phone', 'Rating', 'Quality Score', 'Status', 'Website', 'Maps URL'].join(','),
            ...filteredLeads.map(lead => [
                lead.name,
                lead.category || '',
                lead.address || '',
                lead.phone || '',
                lead.rating || '',
                lead.quality_score || 0,
                lead.status || 'New',
                lead.website || '',
                lead.google_maps_url || ''
            ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const dateStr = new Date().toISOString().split('T')[0];
        const a = document.createElement('a');
        a.href = url;
        a.download = `managed_leads_${dateStr}.csv`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 2000);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Leads Management</h1>
                    <p className="text-gray-600 mt-2">Manage your promoted high-quality business leads</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchLeads}
                        className="btn-secondary"
                    >
                        Refresh
                    </button>
                    <button
                        onClick={handleExport}
                        className="btn-primary flex items-center gap-2"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Export All
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card">
                    <p className="text-sm text-gray-600">Total Managed Leads</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{leads.length}</p>
                </div>
                <div className="card">
                    <p className="text-sm text-gray-600">With Phone</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{leads.filter(l => l.phone).length}</p>
                </div>
                <div className="card">
                    <p className="text-sm text-gray-600">High Quality (85+)</p>
                    <p className="text-3xl font-bold text-purple-600 mt-1">{leads.filter(l => l.quality_score >= 85).length}</p>
                </div>
                <div className="card">
                    <p className="text-sm text-gray-600">Total Opportunities</p>
                    <p className="text-3xl font-bold text-blue-600 mt-1">{leads.length * 5}</p>
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
                                placeholder="Search leads by name, category, or address..."
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
                    </div>
                </div>
            </div>

            {/* Leads Table */}
            <div className="card">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-500">Loading your leads...</p>
                    </div>
                ) : leads.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="p-4 bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <FunnelIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No leads found</h3>
                        <p className="text-gray-500 mt-1">Start by extracting businesses and clicking "Add to Leads"</p>
                        <a href="/extract" className="mt-4 inline-block text-blue-600 hover:underline font-medium">
                            Go to Extraction →
                        </a>
                    </div>
                ) : (
                    <>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600">
                                Showing <span className="font-semibold text-gray-900">{filteredLeads.length}</span> of <span className="font-semibold text-gray-900">{leads.length}</span> managed leads
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Business Name</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Category</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Contact</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Rating/Quality</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLeads.map((lead) => (
                                        <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-4 px-4">
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{lead.name}</p>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                        <MapPinIcon className="w-3 h-3" />
                                                        <span className="truncate max-w-[200px]">{lead.address}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                    {lead.category || 'General'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="space-y-1">
                                                    {lead.phone && (
                                                        <div className="flex items-center gap-1 text-sm text-gray-700">
                                                            <PhoneIcon className="w-3.5 h-3.5 text-green-600" />
                                                            {lead.phone}
                                                        </div>
                                                    )}
                                                    {lead.website && (
                                                        <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                                                            <GlobeAltIcon className="w-3.5 h-3.5" />
                                                            Website
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <select
                                                    value={lead.status || 'New'}
                                                    onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                                    className={`text-xs font-bold px-2 py-1 rounded border-none focus:ring-1 focus:ring-blue-500 cursor-pointer ${lead.status === 'Converted' ? 'bg-green-100 text-green-700' :
                                                            lead.status === 'Contacted' ? 'bg-blue-100 text-blue-700' :
                                                                lead.status === 'Interested' ? 'bg-purple-100 text-purple-700' :
                                                                    lead.status === 'Not Interested' ? 'bg-gray-100 text-gray-700' :
                                                                        'bg-yellow-50 text-yellow-700'
                                                        }`}
                                                >
                                                    <option value="New">New</option>
                                                    <option value="Contacted">Contacted</option>
                                                    <option value="Interested">Interested</option>
                                                    <option value="Not Interested">Not Interested</option>
                                                    <option value="Converted">Converted</option>
                                                </select>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-yellow-500 font-bold">{lead.rating || '-'}</span>
                                                        <span className="text-gray-400 text-[10px]">({lead.review_count || 0})</span>
                                                    </div>
                                                    <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded w-fit ${(lead.quality_score || 0) >= 85 ? 'bg-green-100 text-green-700' :
                                                            (lead.quality_score || 0) >= 70 ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-red-100 text-red-700'
                                                        }`}>
                                                        Q: {lead.quality_score || 0}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex justify-end gap-1">
                                                    {lead.phone && (
                                                        <a
                                                            href={`tel:${lead.phone}`}
                                                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Call Business"
                                                        >
                                                            <PhoneIcon className="w-5 h-5" />
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => window.location.href = `mailto:?subject=Collaboration with ${lead.name}`}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Send Email"
                                                    >
                                                        <EnvelopeIcon className="w-5 h-5" />
                                                    </button>
                                                    {lead.google_maps_url && (
                                                        <a
                                                            href={lead.google_maps_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="View on Google Maps"
                                                        >
                                                            <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteLead(lead.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Lead"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
