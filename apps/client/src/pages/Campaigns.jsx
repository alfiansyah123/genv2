import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import CreateCampaignModal from '../components/CreateCampaignModal';
import { useTheme } from '../context/ThemeContext';

const NetworkBadge = ({ network }) => {
    // Color based on network name
    const getColor = (network) => {
        const colors = {
            'iMonetizeit': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
            'Lospollos': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
            'Clickdealer': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
            'Trafee': { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
        };
        return colors[network] || { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' };
    };

    const color = getColor(network);

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color.bg} ${color.text} ${color.border}`}>
            {network}
        </span>
    )
}

export default function Campaigns() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [campaigns, setCampaigns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { isDark } = useTheme();

    const fetchCampaigns = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/campaigns`);
            if (response.ok) {
                const data = await response.json();
                setCampaigns(data);
            }
        } catch (error) {
            console.error('Error fetching campaigns:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const handleCampaignCreated = (campaign) => {
        setCampaigns(prev => [campaign, ...prev]);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this campaign?')) return;
        try {
            const response = await fetch(`${API_URL}/api/campaigns/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setCampaigns(prev => prev.filter(c => c.id !== id));
            }
        } catch (error) {
            console.error('Error deleting campaign:', error);
        }
    };

    return (
        <>
            <div className="flex flex-col gap-6">
                {/* Page Heading */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Campaign Management</h2>
                        <p className={`text-base ${isDark ? 'text-text-muted' : 'text-gray-500'}`}>Manage and track all active CPA campaigns and their performance.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary/90 transition-colors h-11 px-6 text-white text-sm font-bold shadow-lg shadow-primary/20 whitespace-nowrap cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        <span>Create Campaign</span>
                    </button>
                </div>

                {/* Toolbar */}
                <div className={`flex flex-col sm:flex-row justify-between gap-4 p-4 rounded-xl border mt-4 transition-colors ${isDark ? 'bg-surface-dark border-secondary' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div className="flex flex-1 gap-3">
                        <div className="relative flex-1 max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-text-muted text-[20px]">search</span>
                            </div>
                            <input className={`block w-full pl-10 pr-3 py-2.5 border-none rounded-lg leading-5 outline-none focus:ring-2 focus:ring-primary sm:text-sm ${isDark ? 'bg-[#1e1e2d] text-white placeholder-text-muted' : 'bg-gray-100 text-gray-900 placeholder-gray-400'}`} placeholder="Search by Offer or Network..." type="text" />
                        </div>
                        <button
                            onClick={fetchCampaigns}
                            className={`p-2.5 rounded-lg transition-colors border border-transparent focus:outline-none focus:ring-2 focus:ring-primary ${isDark ? 'bg-[#1e1e2d] text-text-muted hover:text-white hover:bg-[#2a2a3c]' : 'bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}
                            title="Refresh Data"
                        >
                            <span className="material-symbols-outlined text-[20px]">refresh</span>
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <div className={`rounded-xl border overflow-hidden shadow-sm transition-colors ${isDark ? 'bg-surface-dark border-secondary' : 'bg-white border-gray-200'}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className={`border-b ${isDark ? 'bg-[#1e1e2d] border-secondary' : 'bg-gray-50 border-gray-200'}`}>
                                    <th className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider w-20 ${isDark ? 'text-text-muted' : 'text-gray-500'}`}>ID</th>
                                    <th className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider w-28 ${isDark ? 'text-text-muted' : 'text-gray-500'}`}>Country</th>
                                    <th className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider w-32 ${isDark ? 'text-text-muted' : 'text-gray-500'}`}>User Agent</th>
                                    <th className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-text-muted' : 'text-gray-500'}`}>Offer Name</th>
                                    <th className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider w-32 ${isDark ? 'text-text-muted' : 'text-gray-500'}`}>Network</th>
                                    <th className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right w-24 ${isDark ? 'text-text-muted' : 'text-gray-500'}`}>Action</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDark ? 'divide-secondary' : 'divide-gray-100'}`}>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center">
                                            <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Loading campaigns...</span>
                                        </td>
                                    </tr>
                                ) : campaigns.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="material-symbols-outlined text-4xl text-slate-500">campaign</span>
                                                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No campaigns yet. Create your first campaign!</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : campaigns.map((row) => (
                                    <tr key={row.id} className={`transition-colors group ${isDark ? 'hover:bg-[#1e1e2d]/50' : 'hover:bg-gray-50'}`}>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{row.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isDark ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-cyan-50 text-cyan-700 border border-cyan-200'}`}>
                                                Global
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isDark ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-cyan-50 text-cyan-700 border border-cyan-200'}`}>
                                                Global
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{row.offerName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <NetworkBadge network={row.network} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className={`flex items-center justify-end gap-2 transition-opacity ${isDark ? 'opacity-100 lg:opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                                                <button
                                                    onClick={() => handleDelete(row.id)}
                                                    className={`transition-colors p-1 ${isDark ? 'text-slate-400 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}
                                                    title="Delete"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        Showing <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>1</span> to <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>5</span> of <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>128</span> results
                    </p>
                    <nav className={`flex items-center gap-1 p-1 rounded-full border transition-colors ${isDark ? 'bg-[#151525] border-secondary' : 'bg-gray-100 border-gray-200'}`}>
                        <button className={`flex items-center justify-center size-9 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'text-slate-400 hover:text-white hover:bg-[#1e1e2d]' : 'text-gray-500 hover:text-gray-900 hover:bg-white border-transparent'}`}>
                            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                        </button>
                        <button className="flex items-center justify-center size-9 rounded-full bg-primary text-white text-sm font-bold shadow-md shadow-primary/20">1</button>
                        <button className={`flex items-center justify-center size-9 rounded-full transition-colors text-sm ${isDark ? 'text-slate-400 hover:text-white hover:bg-[#1e1e2d]' : 'text-gray-500 hover:text-gray-900 hover:bg-white'}`}>2</button>
                        <button className={`flex items-center justify-center size-9 rounded-full transition-colors text-sm ${isDark ? 'text-slate-400 hover:text-white hover:bg-[#1e1e2d]' : 'text-gray-500 hover:text-gray-900 hover:bg-white'}`}>3</button>
                        <div className={`flex items-center justify-center size-9 text-sm ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>...</div>
                        <button className={`flex items-center justify-center size-9 rounded-full transition-colors text-sm ${isDark ? 'text-slate-400 hover:text-white hover:bg-[#1e1e2d]' : 'text-gray-500 hover:text-gray-900 hover:bg-white'}`}>12</button>
                        <button className={`flex items-center justify-center size-9 rounded-full transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-[#1e1e2d]' : 'text-gray-500 hover:text-gray-900 hover:bg-white'}`}>
                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </button>
                    </nav>
                </div>
            </div>

            <CreateCampaignModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleCampaignCreated} />
        </>
    );
}
