'use client';

import { useState, useEffect } from 'react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    AreaChart, Area
} from 'recharts';
import {
    ChartBarIcon,
    FunnelIcon,
    ArrowPathIcon,
    PhoneIcon,
    GlobeAltIcon,
    DocumentTextIcon,
    BoltIcon
} from '@heroicons/react/24/outline';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#64748B'];

export default function AnalyticsPage() {
    const API_BASE_URL = process.env.NEXT_PUBLIC_MAPS_API_URL || 'http://127.0.0.1:8001';

    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAnalytics = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/analytics`);
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (isLoading && !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px]">
                <ArrowPathIcon className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-500 font-medium text-lg">Analyzing your business landscape...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Market Analysis</h1>
                    <p className="text-gray-600 mt-2">Quantitative insights into your extracted lead database</p>
                </div>
                <button
                    onClick={fetchAnalytics}
                    className="btn-secondary flex items-center gap-2 group"
                >
                    <ArrowPathIcon className={`w-5 h-5 group-hover:rotate-180 transition-transform duration-500 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh Engine
                </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card bg-gradient-to-br from-blue-50 to-white border-blue-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500 rounded-xl">
                            <DocumentTextIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-blue-600 uppercase tracking-wider">Total Inventory</p>
                            <p className="text-3xl font-bold text-gray-900">{data?.metrics.total_records.toLocaleString()}</p>
                            <p className="text-xs text-blue-500 mt-1">Found across all sources</p>
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-green-50 to-white border-green-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500 rounded-xl">
                            <PhoneIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-green-600 uppercase tracking-wider">Phone Coverage</p>
                            <p className="text-3xl font-bold text-gray-900">{data?.metrics.phone_percentage}%</p>
                            <p className="text-xs text-green-500 mt-1">Leads with contact numbers</p>
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-purple-50 to-white border-purple-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500 rounded-xl">
                            <GlobeAltIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-purple-600 uppercase tracking-wider">Digital presence</p>
                            <p className="text-3xl font-bold text-gray-900">{data?.metrics.website_percentage}%</p>
                            <p className="text-xs text-purple-500 mt-1">Leads with web presence</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Trends Chart */}
                <div className="card h-[450px] flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                        <BoltIcon className="w-5 h-5 text-yellow-500" />
                        <h3 className="text-lg font-bold text-gray-900">Leads Acquisition Trend</h3>
                    </div>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.trends}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12, fill: '#64748B' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#64748B' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Area type="monotone" dataKey="count" name="Leads Found" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Distribution */}
                <div className="card h-[450px] flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                        <ChartBarIcon className="w-5 h-5 text-blue-500" />
                        <h3 className="text-lg font-bold text-gray-900">Top Business Categories</h3>
                    </div>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.categories} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    tick={{ fontSize: 12, fill: '#1E293B', fontWeight: 500 }}
                                    width={140}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: '#F1F5F9' }}
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar
                                    dataKey="value"
                                    name="Quantity"
                                    fill="#3B82F6"
                                    radius={[0, 8, 8, 0]}
                                    barSize={24}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quality Distribution */}
                <div className="card lg:col-span-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                        <SparklesIcon className="w-5 h-5 text-purple-500" />
                        <h3 className="text-lg font-bold text-gray-900">Quality Breakdown</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data?.quality}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data?.quality.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Data Completeness Table */}
                <div className="card lg:col-span-2">
                    <div className="flex items-center gap-2 mb-6">
                        <FunnelIcon className="w-5 h-5 text-green-500" />
                        <h3 className="text-lg font-bold text-gray-900">Insight Coverage</h3>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-semibold text-gray-700">Contact Accessibility</span>
                                <span className="text-2xl font-bold text-blue-600">{data?.metrics.phone_percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                                <div
                                    className="bg-blue-500 h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${data?.metrics.phone_percentage}%` }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-semibold text-gray-700">Digital Maturity</span>
                                <span className="text-2xl font-bold text-purple-600">{data?.metrics.website_percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                                <div
                                    className="bg-purple-500 h-full rounded-full transition-all duration-1000 shadow-sm"
                                    style={{ width: `${data?.metrics.website_percentage}%` }}
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mt-8">
                            <h4 className="text-sm font-bold text-gray-900 mb-2">Engine Intelligence Info</h4>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Our scoring algorithm evaluates leads based on 12 distinct factors including review sentiment,
                                business status, and attribute completeness. Higher scores correlate with 85% better conversion likelihood.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SparklesIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
    )
}
