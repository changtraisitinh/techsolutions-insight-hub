'use client';

import { useState, useEffect } from 'react';
import { ChartBarIcon, MapIcon, UsersIcon, SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function Home() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_MAPS_API_URL || 'http://127.0.0.1:8001';

  const [statsData, setStatsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/stats`);
      if (response.ok) {
        const data = await response.json();
        setStatsData(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const stats = statsData ? [
    { name: 'Total Leads Found', value: statsData.total_leads.toLocaleString(), change: 'Raw database records', icon: UsersIcon, color: 'blue' },
    { name: 'Extraction Jobs', value: statsData.total_jobs.toLocaleString(), change: 'Total search runs', icon: MapIcon, color: 'green' },
    { name: 'Avg Quality Score', value: statsData.avg_quality, change: 'Managed leads only', icon: SparklesIcon, color: 'purple' },
    { name: 'Managed Leads', value: statsData.managed_leads.toLocaleString(), change: `${statsData.conversion_rate}% promote rate`, icon: ChartBarIcon, color: 'orange' },
  ] : [];

  const recentExtractions = statsData?.recent_activity || [];

  if (isLoading && !statsData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <ArrowPathIcon className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500">Loading your intelligence dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Platform Overview</h2>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-2">{stat.change}</p>
                </div>
                <div className={`p-3 bg-${stat.color}-50 rounded-lg`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/extract" className="group p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200">
            <MapIcon className="w-8 h-8 text-blue-600 mb-3" />
            <h4 className="font-semibold text-gray-900 mb-1">Extract New Leads</h4>
            <p className="text-sm text-gray-600">Search Google Maps for businesses</p>
          </Link>

          <Link href="/leads" className="group p-6 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200">
            <UsersIcon className="w-8 h-8 text-purple-600 mb-3" />
            <h4 className="font-semibold text-gray-900 mb-1">View All Leads</h4>
            <p className="text-sm text-gray-600">Browse and manage your leads</p>
          </Link>

          <Link href="/analytics" className="group p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200">
            <ChartBarIcon className="w-8 h-8 text-green-600 mb-3" />
            <h4 className="font-semibold text-gray-900 mb-1">View Analytics</h4>
            <p className="text-sm text-gray-600">Analyze lead performance</p>
          </Link>
        </div>
      </div>

      {/* Recent Extractions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Extractions</h3>
          <Link href="/extract" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Keyword</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Location</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Leads</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentExtractions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No recent activity found. Start your first extraction!
                  </td>
                </tr>
              ) : (
                recentExtractions.map((extraction: any) => (
                  <tr key={extraction.job_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{extraction.keyword}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{extraction.location}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{extraction.leads_count}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(extraction.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${extraction.status === 'completed' ? 'bg-green-100 text-green-700' :
                        extraction.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                        {extraction.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
