import { ChartBarIcon, MapIcon, UsersIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function Home() {
  const stats = [
    { name: 'Total Leads', value: '2,543', change: '+12.5%', icon: UsersIcon, color: 'blue' },
    { name: 'Extractions', value: '18', change: '+3 this week', icon: MapIcon, color: 'green' },
    { name: 'Quality Score', value: '78.5', change: '+2.3 pts', icon: SparklesIcon, color: 'purple' },
    { name: 'Conversion Rate', value: '24%', change: '+5.2%', icon: ChartBarIcon, color: 'orange' },
  ];

  const recentExtractions = [
    { id: 1, location: 'Ho Chi Minh City', keyword: 'coffee shop', leads: 58, date: '2024-12-24', status: 'completed' },
    { id: 2, location: 'Hanoi', keyword: 'restaurant', leads: 92, date: '2024-12-23', status: 'completed' },
    { id: 3, location: 'Da Nang', keyword: 'hotel', leads: 45, date: '2024-12-22', status: 'completed' },
  ];

  return (
    <div className="space-y-6">
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
                  <p className="text-sm text-green-600 mt-2">{stat.change}</p>
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
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Location</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Keyword</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Leads Found</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentExtractions.map((extraction) => (
                <tr key={extraction.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm text-gray-900">{extraction.location}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{extraction.keyword}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{extraction.leads}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{extraction.date}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                      {extraction.status}
                    </span>
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
