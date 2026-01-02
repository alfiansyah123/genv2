import React from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function GeneratorNavigation() {
    const { trackerId } = useParams();
    const { isDark } = useTheme();
    const location = useLocation();

    // Helper to determine if a link is active
    const isActive = (path) => {
        if (path === `/${trackerId}`) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="flex justify-center py-6">
            <div className={`
                relative flex items-center p-1.5 rounded-2xl border transition-all duration-300 overflow-x-auto max-w-full no-scrollbar
                ${isDark
                    ? 'bg-[#16172b]/80 border-[#323367] backdrop-blur-xl shadow-lg shadow-black/20'
                    : 'bg-white/80 border-gray-200 backdrop-blur-xl shadow-sm'
                }
            `}>
                {[
                    { path: `/${trackerId}`, label: 'Generator', icon: 'bolt' },
                    { path: `/${trackerId}/bulk-url`, label: 'Bulk URL', icon: 'layers' },
                    { path: `/${trackerId}/addon-domain`, label: 'Addon Domain', icon: 'dns' }
                ].map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`
                                relative px-3 md:px-5 py-2.5 rounded-xl text-xs md:text-sm font-semibold tracking-wide transition-all duration-300 flex items-center gap-1.5 md:gap-2 whitespace-nowrap
                                ${active
                                    ? 'text-white shadow-md transform scale-[1.02]'
                                    : isDark
                                        ? 'text-slate-400 hover:text-white hover:bg-[#1f2038]'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                }
                            `}
                        >
                            {active && (
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl -z-10 animate-fade-in"></div>
                            )}
                            <span className={`material-symbols-outlined text-[18px] ${active ? 'animate-pulse' : ''}`}>
                                {item.icon}
                            </span>
                            {item.label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
