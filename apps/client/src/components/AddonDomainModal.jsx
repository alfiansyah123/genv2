import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

export default function AddonDomainModal({ isOpen, onClose, onSave }) {
    const [trackers, setTrackers] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('global');
    const [domainName, setDomainName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Fetch trackers from API
    useEffect(() => {
        if (isOpen) {
            fetch(`${API_URL}/api/trackers`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setTrackers(data);
                    }
                })
                .catch(err => console.error('Failed to fetch trackers:', err));
        }
    }, [isOpen]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setDomainName('');
            setSelectedGroup('global');
        }
    }, [isOpen]);

    const handleSave = async () => {
        if (!domainName.trim()) {
            alert('Please enter a domain name');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/addon-domains`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    domain: domainName.trim(),
                    group: selectedGroup,
                    trackerId: selectedGroup === 'global' ? null : selectedGroup
                })
            });

            if (response.ok) {
                alert('Domain saved successfully! 🎉');
                setDomainName('');
                setSelectedGroup('global');
                if (onSave) onSave();
                onClose();
            } else {
                const data = await response.json();
                alert('Error: ' + (data.error || 'Failed to save domain'));
            }
        } catch (err) {
            alert('Failed to connect to server');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            ></div>

            {/* Modal Container */}
            <div className="relative z-50 w-full max-w-[600px] transform overflow-hidden rounded-xl bg-surface-dark dark:bg-[#15162e] text-left shadow-2xl transition-all border border-[#323367] flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#323367]">
                    <h2 className="text-white tracking-tight text-[22px] font-bold leading-tight">Add New Addon Domain</h2>
                    <button
                        className="text-[#9293c9] hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                        onClick={onClose}
                    >
                        <span className="material-symbols-outlined text-[24px]">close</span>
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar">

                    {/* Instructions Section */}
                    <div className="mb-6">
                        <p className="text-[#e2e2e8] text-sm font-normal leading-relaxed pb-3">
                            Please create a <strong>CNAME Record</strong> in your domain settings pointing to the following target. This allows your domain to connect securely via our optimized network (Cloudflare).
                        </p>
                        {/* CNAME Target */}
                        <div className="flex flex-col gap-3 mt-2">
                            {/* CNAME */}
                            <div className="flex items-center gap-4 bg-[#0a0b1e] border border-[#323367] rounded-lg px-4 py-3 justify-between group transition-colors hover:border-primary/50">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <span className="material-symbols-outlined text-primary text-[20px]">link</span>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">CNAME Target</span>
                                        <p className="text-white text-sm font-mono tracking-wide truncate">cuanfbpro.shop</p>
                                    </div>
                                </div>
                                <button
                                    className="shrink-0 text-[#9293c9] hover:text-primary transition-colors flex items-center justify-center p-1.5 rounded hover:bg-white/5"
                                    title="Copy to clipboard"
                                    onClick={() => navigator.clipboard.writeText('cuanfbpro.shop')}
                                >
                                    <span className="material-symbols-outlined text-[20px]">content_copy</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="space-y-6 pt-2">
                        {/* Domain Group Select */}
                        <label className="flex flex-col w-full gap-2">
                            <span className="text-[#9293c9] text-xs font-semibold uppercase tracking-wider">Domain Group</span>
                            <div className="relative">
                                <select
                                    className="w-full appearance-none rounded-lg bg-[#0a0b1e] border border-[#323367] text-white py-3 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer text-sm outline-none"
                                    value={selectedGroup}
                                    onChange={(e) => setSelectedGroup(e.target.value)}
                                >
                                    <option value="global">GLOBAL DOMAIN</option>
                                    {trackers.map((tracker) => (
                                        <option key={tracker.id} value={tracker.id}>
                                            {tracker.name.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[#9293c9]">
                                    <span className="material-symbols-outlined text-[24px]">expand_more</span>
                                </div>
                            </div>
                        </label>

                        {/* Domain Name Input */}
                        <label className="flex flex-col w-full gap-2">
                            <span className="text-[#9293c9] text-xs font-semibold uppercase tracking-wider">Domain Name</span>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#5a5cf2]">
                                    <span className="material-symbols-outlined text-[20px]">language</span>
                                </div>
                                <input
                                    className="w-full rounded-lg bg-[#0a0b1e] border border-[#323367] text-white py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-[#4b4c75] text-sm outline-none"
                                    placeholder="e.g. mycoolcampaign.com"
                                    type="text"
                                    value={domainName}
                                    onChange={(e) => setDomainName(e.target.value)}
                                />
                            </div>
                            <span className="text-xs text-[#595a88] px-1">Do not include http:// or https://</span>
                        </label>
                    </div>

                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 bg-[#111122]/50 border-t border-[#323367] flex items-center justify-end gap-3 rounded-b-xl">
                    <button
                        className="px-5 py-2.5 rounded-lg text-sm font-medium text-white hover:bg-white/5 transition-colors border border-transparent hover:border-[#323367]"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-[#484adb] shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleSave}
                        disabled={isLoading}
                    >
                        <span className="material-symbols-outlined text-[18px]">{isLoading ? 'hourglass_empty' : 'check'}</span>
                        {isLoading ? 'Saving...' : 'Save Domain'}
                    </button>
                </div>

            </div>
        </div>
    );
}
