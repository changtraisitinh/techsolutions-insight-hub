'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    HomeIcon,
    MapIcon,
    UsersIcon,
    ChartBarIcon,
    CogIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Extract Leads', href: '/extract', icon: MapIcon },
    { name: 'Leads', href: '/leads', icon: UsersIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Settings', href: '/settings', icon: CogIcon },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Insight Hub</h1>
                        <p className="text-xs text-gray-500">Business Intelligence</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-blue-50 text-blue-600 font-medium'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                    <p>© 2024 Insight Hub</p>
                    <p className="mt-1">v0.1.0 Beta</p>
                </div>
            </div>
        </div>
    );
}
