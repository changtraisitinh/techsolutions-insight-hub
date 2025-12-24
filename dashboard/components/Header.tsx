'use client';

import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function Header() {
    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
                    <p className="text-sm text-gray-500 mt-1">Here's what's happening with your leads today</p>
                </div>

                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                        <BellIcon className="w-6 h-6 text-gray-600" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">Admin User</p>
                            <p className="text-xs text-gray-500">admin@insighthub.com</p>
                        </div>
                        <UserCircleIcon className="w-10 h-10 text-gray-400" />
                    </div>
                </div>
            </div>
        </header>
    );
}
