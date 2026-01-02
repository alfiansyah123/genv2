import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../config';

const MAX_ITEMS = 5;

export default function LiveTraffic() {
    const { isDark } = useTheme();
    const [traffic, setTraffic] = useState([]);
    const [isPaused, setIsPaused] = useState(false);
    const wsRef = useRef(null);

    useEffect(() => {
        // Connect to WebSocket
        // Connect to WebSocket
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = API_URL.replace(/^https?:\/\//, '');
        const wsUrl = `${protocol}//${host}/ws/live-traffic`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('Connected to Live Traffic WebSocket');
        };

        ws.onmessage = (event) => {
            if (isPaused) return;

            try {
                const message = JSON.parse(event.data);
                if (message.type === 'click') {
                    const newClick = {
                        id: Date.now() + Math.random(), // Unique ID for key
                        country: message.data.country,
                        countryCode: message.data.country || 'Unknown',
                        name: message.data.trackerId || 'Unknown',
                        flag: message.data.country
                            ? `https://flagcdn.com/w20/${message.data.country.toLowerCase()}.png`
                            : 'https://flagcdn.com/w20/un.png'
                    };

                    setTraffic((prev) => {
                        const newState = [newClick, ...prev];
                        return newState.slice(0, MAX_ITEMS); // Keep only last 5
                    });
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [isPaused]);

    return (
        <div className={`rounded-xl border p-4 ${isDark ? 'bg-surface-dark border-surface-border' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-3">
                <h3 className={`text-xs font-bold uppercase ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Live Traffic
                </h3>
                <button
                    onClick={() => setIsPaused(!isPaused)}
                    className={`transition-colors ${isDark ? 'text-slate-500 hover:text-primary' : 'text-gray-400 hover:text-primary'}`}
                >
                    <span className="material-symbols-outlined text-base">
                        {isPaused ? 'play_arrow' : 'pause'}
                    </span>
                </button>
            </div>

            <div className="space-y-2 min-h-[150px]">
                {traffic.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-500 opacity-50">
                        <span className="material-symbols-outlined text-[32px] mb-2">radar</span>
                        <span className="text-xs">Waiting for clicks...</span>
                    </div>
                ) : (
                    traffic.map((item, index) => (
                        <div
                            key={item.id}
                            className={`flex items-center rounded p-2 shadow-sm border animate-in slide-in-from-top-2 fade-in duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ${index === 0 ? 'animate-pulse' : ''}`}
                        >
                            <div className={`flex-shrink-0 w-8 h-5 rounded mr-2 overflow-hidden relative ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                <img
                                    alt={`${item.country} Flag`}
                                    className="object-cover w-full h-full"
                                    src={item.flag}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            </div>
                            <span className="text-xs font-mono font-medium truncate text-blue-500">
                                {item.name}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
