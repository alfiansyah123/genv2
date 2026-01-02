import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function ChangePassword() {
    const { isDark } = useTheme();
    const { logout } = useAuth();

    // Form state
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        // Basic validation
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (newPassword.length < 4) {
            setMessage({ type: 'error', text: 'Password must be at least 4 characters' });
            return;
        }

        setIsSubmitting(true);

        try {
            // const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${API_URL}/api/auth/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ oldPassword, newPassword })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Password updated successfully!' });
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                // Optional: logout user after change
                // logout();
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to update password' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Connection failed' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto">
            <div className="mb-6">
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Change Password
                </h1>
                <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    Update your admin access password
                </p>
            </div>

            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#1e1e2d] border-[#2d2d42]' : 'bg-white border-gray-100 shadow-sm'}`}>
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Old Password */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                            Current Password
                        </label>
                        <input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${isDark
                                ? 'bg-[#16172b] text-white border border-[#2d2d42] focus:border-primary focus:ring-2 focus:ring-primary/20'
                                : 'bg-gray-50 text-gray-900 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white'
                                }`}
                            placeholder="Enter current password"
                            required
                        />
                    </div>

                    {/* New Password */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                            New Password
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${isDark
                                ? 'bg-[#16172b] text-white border border-[#2d2d42] focus:border-primary focus:ring-2 focus:ring-primary/20'
                                : 'bg-gray-50 text-gray-900 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white'
                                }`}
                            placeholder="Enter new password"
                            required
                        />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${isDark
                                ? 'bg-[#16172b] text-white border border-[#2d2d42] focus:border-primary focus:ring-2 focus:ring-primary/20'
                                : 'bg-gray-50 text-gray-900 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white'
                                }`}
                            placeholder="Confirm new password"
                            required
                        />
                    </div>

                    {/* Messages */}
                    {message.text && (
                        <div className={`p-4 rounded-xl flex items-center gap-2 text-sm ${message.type === 'error'
                            ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                            : 'bg-green-500/10 text-green-500 border border-green-500/20'
                            }`}>
                            <span className="material-symbols-outlined text-lg">
                                {message.type === 'error' ? 'error' : 'check_circle'}
                            </span>
                            {message.text}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-lg shadow-primary/25 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
