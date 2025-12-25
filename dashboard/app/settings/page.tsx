'use client';

import { useState, useEffect } from 'react';
import {
    CogIcon,
    CircleStackIcon,
    KeyIcon,
    ScaleIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
    const API_BASE_URL = process.env.NEXT_PUBLIC_MAPS_API_URL || 'http://127.0.0.1:8001';

    const [settings, setSettings] = useState<any>(null);
    const [health, setHealth] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isResetting, setIsResetting] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [settingsRes, healthRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/settings`),
                fetch(`${API_BASE_URL}/api/health`)
            ]);

            if (settingsRes.ok) setSettings(await settingsRes.json());
            if (healthRes.ok) setHealth(await healthRes.json());
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleResetDatabase = async () => {
        if (!confirm('CRITICAL ACTION: This will delete ALL leads and extraction jobs from the database. This cannot be undone. Are you sure?')) {
            return;
        }

        const password = prompt('Please type "RESET" to confirm:');
        if (password !== 'RESET') return;

        setIsResetting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/database/reset`, { method: 'POST' });
            if (response.ok) {
                alert('Database successfully wiped.');
                fetchData();
            }
        } catch (error) {
            alert('Failed to reset database');
        } finally {
            setIsResetting(false);
        }
    };

    if (isLoading && !settings) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <ArrowPathIcon className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-500">Loading system configuration...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
                <p className="text-gray-600 mt-2">Manage API configurations, lead scoring, and database hygiene</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar Navigation (Visual Only) */}
                <div className="md:col-span-1 space-y-1">
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-blue-50 text-blue-700 font-medium">
                        <CogIcon className="w-5 h-5" />
                        General Configuration
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50">
                        <ScaleIcon className="w-5 h-5" />
                        Scoring Logic
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50">
                        <KeyIcon className="w-5 h-5" />
                        API Keys
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50">
                        <ExclamationTriangleIcon className="w-5 h-5" />
                        Maintenance
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="md:col-span-2 space-y-8">

                    {/* System Health */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <ShieldCheckIcon className="w-5 h-5 text-green-500" />
                                <h3 className="text-lg font-bold text-gray-900">System Status</h3>
                            </div>
                            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                LIVE
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <CircleStackIcon className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700">PostgreSQL Database</span>
                                </div>
                                <span className={`text-xs font-bold ${health?.database === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                                    {health?.database?.toUpperCase() || 'UNKNOWN'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <KeyIcon className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700">Google Maps API</span>
                                </div>
                                <span className={`text-xs font-bold ${health?.google_api_configured ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {health?.google_api_configured ? 'READY' : 'MISSING KEY'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Lead Scoring Weights */}
                    <div className="card">
                        <div className="flex items-center gap-2 mb-6">
                            <ScaleIcon className="w-5 h-5 text-blue-500" />
                            <h3 className="text-lg font-bold text-gray-900">Lead Scoring Engine</h3>
                        </div>

                        <p className="text-sm text-gray-500 mb-6 font-medium">
                            The algorithm automatically assigns a score (0-100) based on weighted business attributes:
                        </p>

                        <div className="space-y-4">
                            {Object.entries(settings?.scoring || {}).map(([key, value]: [string, any]) => (
                                <div key={key}>
                                    <div className="flex justify-between text-xs mb-1.5 uppercase font-bold tracking-wider text-gray-600">
                                        <span>{key.replace(/_/g, ' ')}</span>
                                        <span className="text-blue-600">+{value}pts</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-full rounded-full"
                                            style={{ width: `${(value / 30) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Maintenance */}
                    <div className="card border-red-100 bg-red-50/10">
                        <div className="flex items-center gap-2 mb-6">
                            <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                            <h3 className="text-lg font-bold text-red-900">Danger Zone</h3>
                        </div>

                        <div className="p-4 border border-red-200 rounded-xl bg-white">
                            <h4 className="text-sm font-bold text-gray-900 mb-1">Clear Platform History</h4>
                            <p className="text-xs text-gray-500 mb-4">
                                This will permanently delete all stored leads and previous extraction job metadata.
                            </p>
                            <button
                                onClick={handleResetDatabase}
                                disabled={isResetting}
                                className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                                {isResetting ? 'Wiping...' : 'Reset Database'}
                            </button>
                        </div>
                    </div>

                    {/* Environment Info */}
                    <div className="flex items-center justify-center gap-8 py-4 px-6 bg-gray-100 rounded-2xl border border-gray-200">
                        <div className="text-center">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Version</p>
                            <p className="text-sm font-bold text-gray-700">{settings?.environment.version}</p>
                        </div>
                        <div className="w-px h-8 bg-gray-300"></div>
                        <div className="text-center">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Environment</p>
                            <p className="text-sm font-bold text-gray-700">Production Mode</p>
                        </div>
                        <div className="w-px h-8 bg-gray-300"></div>
                        <div className="text-center">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">API Endpoint</p>
                            <p className="text-sm font-bold text-gray-700">Port {settings?.environment.api_port}</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
