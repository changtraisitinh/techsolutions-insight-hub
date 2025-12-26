'use client';

import { useState } from 'react';
import {
    SparklesIcon,
    MagnifyingGlassIcon,
    ChatBubbleBottomCenterIcon,
    PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';

const SAMPLE_SUGGESTIONS = [
    "Analyze Highlands Coffee in District 1",
    "Find digital gaps for Phuc Long Tea in Hanoi",
    "Research emerging coffee chains in Da Nang"
];

export default function AgentPage() {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [error, setError] = useState('');

    const handleResearch = async () => {
        if (!query.trim()) return;

        setIsLoading(true);
        setError('');

        // Optimistically add user message
        setMessages(prev => [...prev, { role: 'user', content: query }]);

        try {
            const agentApiUrl = process.env.NEXT_PUBLIC_AGENT_SERVICE_URL || 'http://localhost:8080';
            const response = await fetch(`${agentApiUrl}/api/v1/agent/research`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    businessName: query,
                    location: 'Vietnam',
                    apiKey: localStorage.getItem('gemini_api_key') || undefined
                }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                setMessages(prev => [...prev, {
                    role: 'agent',
                    content: data.data.summary || "No insights found.",
                    trace: data.data.trace
                }]);
            } else {
                if (data.details?.code === '429') {
                    setMessages(prev => [...prev, {
                        role: 'agent',
                        content: "**Disclaimer: Live Agent API is currently rate-limited.**\n\nHere is a simulated response based on your query:\n\n**Analysis of " + query + "**\n\n1. **Digital Presence**: Strong website traffic, but social media engagement is declining.\n2. **Gaps**: No TikTok presence despite young demographic target.\n3. **Recommendation**: Launch a short-form video campaign and optimize GMB listing.",
                        trace: []
                    }]);
                } else {
                    setError(data.details?.message || 'Agent failed to respond.');
                }
            }
        } catch (err) {
            setError('Failed to connect to Agent Orchestrator. Is it running?');
            console.error(err);
        } finally {
            setIsLoading(false);
            setQuery(''); // Clear input? Or keep it?
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6 h-screen flex flex-col">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Agent Research</h1>
                    <p className="text-sm text-gray-500">Deep dive analysis powered by Gemini</p>
                </div>
            </div>

            {/* Chat / Results Area */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                            <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">Ready to Research</h3>
                            <p className="text-gray-500 max-w-md">
                                Enter a business name to analyze their digital presence, reviews, and market gaps.
                            </p>

                            <div className="mt-8 grid grid-cols-1 gap-3">
                                {SAMPLE_SUGGESTIONS.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setQuery(s)}
                                        className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'agent' && (
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                        <SparklesIcon className="w-4 h-4 text-indigo-600" />
                                    </div>
                                )}

                                <div className={`p-4 rounded-2xl max-w-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-800'
                                    }`}>
                                    {msg.role === 'agent' ? (
                                        <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-ul:text-gray-800">
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        <div className="whitespace-pre-wrap">
                                            {msg.content}
                                        </div>
                                    )}
                                    {/* Show detailed trace if available for debugging */}
                                    {msg.trace && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <p className="text-xs font-semibold text-gray-500 uppercase">Analysis Trace</p>
                                            <div className="text-xs font-mono text-gray-600 mt-2 space-y-1">
                                                {msg.trace.map((t: any, i: number) => (
                                                    <div key={i} className="flex gap-2">
                                                        <span className="text-gray-400">[{new Date(t.timestamp).toLocaleTimeString()}]</span>
                                                        <span>{t.type}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        <UsersIcon className="w-4 h-4 text-blue-600" />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center animate-pulse">
                                <SparklesIcon className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div className="bg-gray-50 p-4 rounded-2xl">
                                <div className="flex space-x-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                                </div>
                            </div>
                        </div>
                    )}
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                            Error: {error}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
                            placeholder="Enter business name (e.g. Highlands Coffee)"
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleResearch}
                            disabled={isLoading || !query.trim()}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                        >
                            <PaperAirplaneIcon className="w-5 h-5" />
                            <span>Analyze</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function UsersIcon(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
    )
}
