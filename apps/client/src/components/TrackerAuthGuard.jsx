import React, { useState, useEffect } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../config';

export default function TrackerAuthGuard() {
    const { trackerId } = useParams();
    const { isDark } = useTheme();

    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [error, setError] = useState('');
    // We can expose trackerData via context if needed, 
    // but for now let's just handle the gate. 
    // Ideally we pass data down, but Outlet context is an option.

    useEffect(() => {
        checkAuth();
    }, [trackerId]);

    const checkAuth = async () => {
        setIsLoading(true);
        setError('');

        // 1. Check Session Storage
        const sessionKey = `tracker_auth_${trackerId}`;
        if (sessionStorage.getItem(sessionKey) === 'true') {
            setIsAuthenticated(true);
            setIsLoading(false);
            return;
        }

        // 2. Check Backend if we need password
        try {
            const response = await fetch(`${API_URL}/api/trackers/slug/${trackerId}`);
            if (response.ok) {
                const data = await response.json();
                if (!data.hasPassword) {
                    // No password needed, mark as authenticated (and maybe save session to avoid refetch?)
                    // Actually, if no password, we don't strictly *need* to save session, 
                    // but it saves a fetch. Let's act as if auth is required but passed.
                    setIsAuthenticated(true);
                    sessionStorage.setItem(sessionKey, 'true');
                } else {
                    // Password needed, and we don't have session -> Locked
                    setIsAuthenticated(false);
                }
            } else {
                setError('Tracker not found');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/trackers/verify-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug: trackerId, password: passwordInput })
            });

            if (response.ok) {
                setIsAuthenticated(true);
                sessionStorage.setItem(`tracker_auth_${trackerId}`, 'true');
            } else {
                setError('Incorrect password');
            }
        } catch (err) {
            setError('Verification failed');
        }
    };

    if (isLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#111122]' : 'bg-gray-50'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error === 'Tracker not found') {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center px-4 ${isDark ? 'bg-[#111122]' : 'bg-gray-50'}`}>
                <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Tracker Not Found</h1>
                <p className={isDark ? 'text-slate-400' : 'text-gray-500'}>The tracker <strong>{trackerId}</strong> does not exist.</p>
            </div>
        )
    }

    if (!isAuthenticated) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center px-4 ${isDark ? 'bg-[#111122]' : 'bg-gray-50'}`}>
                <div className={`w-full max-w-md p-8 rounded-2xl shadow-xl ${isDark ? 'bg-[#1e1e2d] border border-[#2d2d42]' : 'bg-white border border-gray-100'}`}>
                    <div className="text-center mb-8">
                        <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl text-primary">lock</span>
                        </div>
                        <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Tracker Locked</h1>
                        <p className={isDark ? 'text-slate-400' : 'text-gray-500'}>Please enter the password to access <strong>{trackerId}</strong></p>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                        <div>
                            <input
                                type="password"
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${isDark
                                    ? 'bg-[#16172b] text-white border-transparent focus:ring-2 focus:ring-primary placeholder-slate-600'
                                    : 'bg-gray-50 text-gray-900 border-gray-200 focus:ring-2 focus:ring-primary focus:bg-white'
                                    }`}
                                placeholder="Enter Password..."
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-lg shadow-primary/25 transition-all transform active:scale-[0.98]"
                        >
                            Unlock Tracker
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Authenticated -> Render children routes
    return <Outlet />;
}
