'use client';

import { BuildingOfficeIcon, MapPinIcon, CurrencyDollarIcon, HomeIcon } from '@heroicons/react/24/outline';

const stats = [
    { name: 'Total Properties', value: '12,045', change: '+12%', changeType: 'increase' },
    { name: 'Avg. Market Price', value: '$850k', change: '+5.4%', changeType: 'increase' },
    { name: 'High Growth Areas', value: '8', change: '3 new', changeType: 'neutral' },
    { name: 'Investment Op.', value: '156', change: '+24%', changeType: 'increase' },
];

const areas = [
    { name: 'Downtown District', growth: '15%', price: '$1.2M', trend: 'up' },
    { name: 'Westside Suburbs', growth: '8%', price: '$750k', trend: 'up' },
    { name: 'Industrial Zone', growth: '-2%', price: '$450k', trend: 'down' },
    { name: 'North Hills', growth: '12%', price: '$920k', trend: 'up' },
];

export default function RealEstatePage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Real-Estate Analysis</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Market insights, property valuation tracking, and investment opportunities.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">{stat.name}</h3>
                        <div className="mt-2 flex items-baseline justify-between">
                            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.changeType === 'increase' ? 'bg-green-50 text-green-700' :
                                    stat.changeType === 'decrease' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'
                                }`}>
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Market Map Placeholder */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Market Heatmap</h2>
                        <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View Full Map</button>
                    </div>
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border border-gray-100 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
                        <div className="text-center">
                            <MapPinIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 font-medium">Interactive Map Integration</p>
                            <p className="text-xs text-gray-400">Showing property values and growth hotpots</p>
                        </div>
                    </div>
                </div>

                {/* Top Growth Areas */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Growth Areas</h2>
                    <div className="space-y-4">
                        {areas.map((area) => (
                            <div key={area.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                                <div>
                                    <p className="font-medium text-gray-900">{area.name}</p>
                                    <p className="text-xs text-gray-500">Avg: {area.price}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-green-600">+{area.growth}</p>
                                    <p className="text-xs text-gray-400">YoY</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 py-2 text-sm text-center text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                        View All Regions
                    </button>
                </div>
            </div>
        </div>
    );
}
