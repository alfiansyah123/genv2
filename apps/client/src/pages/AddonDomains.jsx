import React, { useState } from 'react';
import { API_URL } from '../config';
import AddonDomainModal from '../components/AddonDomainModal';
import { useTheme } from '../context/ThemeContext';



const StatusBadge = ({ status, isDark, onClick }) => {
    let styles = "";
    if (status === 'Active') styles = isDark ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-green-50 text-green-600 border border-green-200";
    if (status === 'Pending') styles = isDark ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" : "bg-yellow-50 text-yellow-600 border border-yellow-200";
    if (status === 'Inactive') styles = isDark ? "bg-slate-700 text-slate-300 border border-slate-600" : "bg-gray-100 text-gray-500 border border-gray-200";

    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium cursor-pointer transition-opacity hover:opacity-80 ${styles}`}
            title="Click to toggle status"
        >
            {status}
        </button>
    );
};

const DomainIcon = ({ color, isDark }) => {
    let bgClass, textClass;
    if (color === 'blue') { bgClass = isDark ? 'bg-blue-500/10' : 'bg-blue-50'; textClass = isDark ? 'text-blue-400' : 'text-blue-600'; }
    if (color === 'purple') { bgClass = isDark ? 'bg-purple-500/10' : 'bg-purple-50'; textClass = isDark ? 'text-purple-400' : 'text-purple-600'; }
    if (color === 'orange') { bgClass = isDark ? 'bg-orange-500/10' : 'bg-orange-50'; textClass = isDark ? 'text-orange-400' : 'text-orange-600'; }
    if (color === 'slate') { bgClass = isDark ? 'bg-slate-700/50' : 'bg-gray-100'; textClass = isDark ? 'text-slate-400' : 'text-gray-500'; }
    if (color === 'teal') { bgClass = isDark ? 'bg-teal-500/10' : 'bg-teal-50'; textClass = isDark ? 'text-teal-400' : 'text-teal-600'; }

    return (
        <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${bgClass} ${textClass}`}>
            <span className="material-symbols-outlined text-[18px]">public</span>
        </div>
    );
}

export default function AddonDomains() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [domains, setDomains] = useState([]);
    const { isDark } = useTheme();

    const fetchDomains = () => {
        fetch(`${API_URL}/api/addon-domains`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setDomains(data);
                }
            })
            .catch(err => console.error('Failed to fetch domains:', err));
    };

    // Fetch on mount
    React.useEffect(() => {
        fetchDomains();
    }, []);

    const handleDelete = async (id, dbId) => {
        if (window.confirm(`Are you sure you want to delete ${id}?`)) {
            try {
                const response = await fetch(`${API_URL}/api/addon-domains/${dbId}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    fetchDomains();
                } else {
                    alert('Failed to delete domain');
                }
            } catch (err) {
                console.error('Error deleting domain:', err);
                alert('Error deleting domain');
            }
        }
    };

    const handleToggleStatus = async (dbId, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';

        try {
            const response = await fetch(`${API_URL}/api/addon-domains/${dbId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                // Optimistic update
                setDomains(prev => prev.map(d =>
                    d.dbId === dbId ? { ...d, status: newStatus } : d
                ));
            } else {
                alert('Failed to update status');
            }
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Error updating status');
        }
    };



    return (
        <>
            <div className="flex flex-col gap-6">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm">
                    <a className={`transition-colors font-medium ${isDark ? 'text-text-muted hover:text-primary' : 'text-gray-500 hover:text-primary'}`} href="/">Home</a>
                    <span className={`font-medium ${isDark ? 'text-text-muted' : 'text-gray-300'}`}>/</span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Addon Domains</span>
                </div>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className={`text-2xl md:text-[32px] font-bold tracking-tight leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Addon Domain Management</h1>
                        <p className={`text-sm font-normal ${isDark ? 'text-text-muted' : 'text-gray-500'}`}>Manage and configure your CPA tracking domains.</p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                    {/* Search */}
                    <div className="w-full md:w-96 h-12">
                        <label className={`relative flex w-full items-center h-full rounded-lg focus-within:ring-2 ring-primary/50 transition-shadow shadow-none overflow-hidden border ${isDark ? 'bg-surface-dark border-transparent' : 'bg-white border-gray-200 shadow-sm'}`}>
                            <div className="grid place-items-center h-full w-12 text-text-muted bg-transparent">
                                <span className="material-symbols-outlined">search</span>
                            </div>
                            <input
                                className={`peer h-full w-full outline-none bg-transparent text-base font-normal pr-4 ${isDark ? 'text-white placeholder:text-text-muted' : 'text-gray-900 placeholder:text-gray-400'}`}
                                id="search"
                                placeholder="Search by Empid or Domain Title..."
                                type="text"
                            />
                        </label>
                    </div>
                    {/* Buttons */}
                    <div className="flex gap-3 h-12">
                        <button className={`flex items-center justify-center px-4 rounded-lg transition-colors gap-2 text-sm font-bold min-w-[100px] h-full cursor-pointer border ${isDark ? 'bg-surface-dark text-white border-transparent hover:bg-[#2d2e5c]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`} onClick={fetchDomains}>
                            <span className="material-symbols-outlined text-[20px]">refresh</span>
                            <span>Refresh</span>
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center justify-center px-6 rounded-lg bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all gap-2 text-sm font-bold h-full cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            <span>Addon Domain</span>
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <div className={`w-full rounded-xl shadow-sm border overflow-hidden flex flex-col transition-colors ${isDark ? 'bg-surface-dark border-secondary' : 'bg-white border-gray-200'}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className={`border-b ${isDark ? 'bg-[#1e1e2d] border-secondary' : 'bg-gray-50 border-gray-200'}`}>
                                    <th className={`p-4 pl-6 text-xs font-semibold uppercase tracking-wider w-[140px] ${isDark ? 'text-text-muted' : 'text-gray-500'}`}>Empid</th>
                                    <th className={`p-4 text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-text-muted' : 'text-gray-500'}`}>Domain Title</th>
                                    <th className={`p-4 text-xs font-semibold uppercase tracking-wider w-[150px] ${isDark ? 'text-text-muted' : 'text-gray-500'}`}>Status</th>
                                    <th className={`p-4 pr-6 text-xs font-semibold uppercase tracking-wider text-right w-[120px] ${isDark ? 'text-text-muted' : 'text-gray-500'}`}>Action</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDark ? 'divide-secondary' : 'divide-gray-100'}`}>
                                {domains.map((row) => (
                                    <tr key={row.id} className={`transition-colors group ${isDark ? 'hover:bg-[#232448]/50' : 'hover:bg-gray-50'}`}>
                                        <td className="p-4 pl-6">
                                            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{row.id}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <DomainIcon color={row.iconColor} isDark={isDark} />
                                                <span className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{row.title}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <StatusBadge
                                                status={row.status}
                                                isDark={isDark}
                                                onClick={() => handleToggleStatus(row.dbId, row.status)}
                                            />
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button aria-label="Edit" className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-primary hover:bg-primary/10' : 'text-gray-400 hover:text-primary hover:bg-primary/5'}`}>
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                                <button
                                                    aria-label="Delete"
                                                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-red-500 hover:bg-red-500/10' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                                                    onClick={() => handleDelete(row.title, row.dbId)}
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className={`flex items-center justify-between p-4 px-6 border-t ${isDark ? 'border-secondary bg-[#1E1F36]' : 'border-gray-200 bg-gray-50'}`}>
                        <p className={`text-sm ${isDark ? 'text-text-muted' : 'text-gray-500'}`}>
                            Showing <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{domains.length > 0 ? '1' : '0'}-{domains.length}</span> of <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{domains.length}</span>
                        </p>
                        <div className="flex gap-2">
                            <button className={`flex items-center justify-center w-8 h-8 rounded border transition-colors disabled:opacity-50 ${isDark ? 'bg-background-dark border-white/10 text-white hover:bg-[#2d2e5c]' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`} disabled>
                                <span className="material-symbols-outlined text-sm">chevron_left</span>
                            </button>
                            <button className="flex items-center justify-center w-8 h-8 rounded bg-primary text-white border border-primary shadow-sm transition-colors">
                                <span className="text-sm font-medium">1</span>
                            </button>
                            <button className={`flex items-center justify-center w-8 h-8 rounded border transition-colors ${isDark ? 'bg-background-dark border-white/10 text-white hover:bg-[#2d2e5c]' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                                <span className="text-sm font-medium">2</span>
                            </button>
                            <button className={`flex items-center justify-center w-8 h-8 rounded border transition-colors ${isDark ? 'bg-background-dark border-white/10 text-white hover:bg-[#2d2e5c]' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                                <span className="text-sm font-medium">3</span>
                            </button>
                            <span className={`flex items-center justify-center w-8 h-8 pb-2 ${isDark ? 'text-text-muted' : 'text-gray-400'}`}>...</span>
                            <button className={`flex items-center justify-center w-8 h-8 rounded border transition-colors ${isDark ? 'bg-background-dark border-white/10 text-white hover:bg-[#2d2e5c]' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <AddonDomainModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={fetchDomains} />
        </>
    );
}
