import React, { useState } from 'react';
import { API_URL } from '../config';

// Network configurations with URL templates and postback endpoints
const networkConfig = {
    iMonetizeit: {
        urlTemplate: 'https://domain.com/c/xx?s1=xx&s2=xx&s3={sub_id}&click_id={click_id}&j1=1&j3=1',
        postbackEndpoint: 'https://domain.com/postback/?click_id={click_id}&payout={payout}',
        macros: ['{sub_id}', '{click_id}'],
        tokens: ['{click_id}', '{payout}']
    },
    Trafee: {
        urlTemplate: 'https://domain.com/c/xxxxx?subsource={sub_id}&track={click_id}',
        postbackEndpoint: 'https://domain.com/api/postback.php?network=Trafee&click_id={track}&payout={sum}',
        macros: ['{sub_id}', '{click_id}'],
        tokens: ['{track}', '{sum}']
    },
    Lospollos: {
        urlTemplate: 'https://domain.com/?u=xx&o=xx&t={sub_id}&cid={click_id}',
        postbackEndpoint: 'https://domain.com/api/postback.php?network=Lospollos&click_id={cid}&payout={sum}',
        macros: ['{sub_id}', '{click_id}'],
        tokens: ['{cid}', '{sum}']
    },
    Clickdealer: {
        urlTemplate: 'https://domain.com/smartlink/?a=164186&sm=20488&mt=16&s1={sub_id}&s2={click_id}&j1=1&j3=1',
        postbackEndpoint: 'https://domain.com/api/postback.php?network=Clickdealer&click_id=#s2#&payout=#price#',
        macros: ['{sub_id}', '{click_id}'],
        tokens: ['#s2#', '#price#']
    }
};

export default function CreateCampaignModal({ isOpen, onClose, onSuccess }) {
    const [selectedNetwork, setSelectedNetwork] = useState('');
    const [offerName, setOfferName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const currentConfig = networkConfig[selectedNetwork] || null;

    const handleSubmit = async () => {
        if (!selectedNetwork) {
            setError('Please select a network');
            return;
        }
        if (!offerName.trim()) {
            setError('Please enter an offer name');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/campaigns`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    network: selectedNetwork,
                    urlTemplate: currentConfig.urlTemplate,
                    postbackEndpoint: currentConfig.postbackEndpoint,
                    offerName: offerName.trim()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create campaign');
            }

            const campaign = await response.json();
            setSelectedNetwork('');
            setOfferName('');
            if (onSuccess) onSuccess(campaign);
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to save campaign');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            ></div>

            {/* Modal Container */}
            <div className="relative z-50 w-full max-w-md transform overflow-hidden rounded-xl bg-white dark:bg-[#191a33] text-left shadow-xl transition-all border border-surface-border/50">

                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-surface-border px-5 py-4">
                    <div>
                        <h2 className="text-xl font-bold leading-6 text-gray-900 dark:text-white">Create New Campaign</h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-text-muted">Configure your new tracking campaign parameters below.</p>
                    </div>
                    <button
                        className="group rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2b2c50] hover:text-gray-500 focus:outline-none transition-colors"
                        type="button"
                        onClick={onClose}
                    >
                        <span className="sr-only">Close panel</span>
                        <span className="material-symbols-outlined group-hover:text-primary">close</span>
                    </button>
                </div>

                {/* Modal Body */}
                <div className="px-5 py-5 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">

                    {/* Network Selection */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white" htmlFor="network-select">Select CPA Network</label>
                        <div className="relative">
                            <select
                                className="block w-full rounded-lg border-0 py-3 pl-4 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-[#111122] dark:text-white dark:ring-surface-border dark:focus:ring-primary sm:text-sm sm:leading-6 appearance-none outline-none"
                                id="network-select"
                                value={selectedNetwork}
                                onChange={(e) => setSelectedNetwork(e.target.value)}
                            >
                                <option disabled value="">Choose a network...</option>
                                <option value="iMonetizeit">iMonetizeit</option>
                                <option value="Lospollos">Lospollos</option>
                                <option value="Clickdealer">Clickdealer</option>
                                <option value="Trafee">Trafee</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                <span className="material-symbols-outlined text-gray-400">expand_more</span>
                            </div>
                        </div>
                    </div>

                    {/* Campaign Parameters Section */}
                    <div className="rounded-lg border border-gray-200 bg-gray-50 dark:border-surface-border dark:bg-[#1e1f3a]/50 p-4 space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Campaign Parameters</h3>
                        </div>
                        <div className="grid gap-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-text-muted">URL Template</span>
                                    {currentConfig && (
                                        <button
                                            className="text-xs text-primary hover:text-primary-hover flex items-center gap-1"
                                            onClick={() => navigator.clipboard.writeText(currentConfig.urlTemplate)}
                                        >
                                            <span className="material-symbols-outlined text-[14px]">content_copy</span> Copy
                                        </button>
                                    )}
                                </div>
                                <div className="rounded bg-white dark:bg-[#111122] p-3 text-sm font-mono text-gray-600 dark:text-gray-300 break-all border border-gray-200 dark:border-surface-border">
                                    {currentConfig ? currentConfig.urlTemplate : <span className="text-gray-400 italic">Select a network to see URL template...</span>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-text-muted">Available Macros</span>
                                <div className="flex flex-wrap gap-2">
                                    {currentConfig ? currentConfig.macros.map((macro) => (
                                        <span key={macro} className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">{macro}</span>
                                    )) : (
                                        <>
                                            <span className="inline-flex items-center rounded-md bg-gray-200 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-500">---</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Postback URL Section */}
                    <div className="rounded-lg border border-gray-200 bg-gray-50 dark:border-surface-border dark:bg-[#1e1f3a]/50 p-4 space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-primary text-[20px]">webhook</span>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Global Postback URL</h3>
                        </div>
                        <div className="grid gap-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-text-muted">Postback Endpoint</span>
                                    {currentConfig && (
                                        <button
                                            className="text-xs text-primary hover:text-primary-hover flex items-center gap-1"
                                            onClick={() => navigator.clipboard.writeText(currentConfig.postbackEndpoint)}
                                        >
                                            <span className="material-symbols-outlined text-[14px]">content_copy</span> Copy
                                        </button>
                                    )}
                                </div>
                                <div className="rounded bg-white dark:bg-[#111122] p-3 text-sm font-mono text-gray-600 dark:text-gray-300 break-all border border-gray-200 dark:border-surface-border">
                                    {currentConfig ? currentConfig.postbackEndpoint : <span className="text-gray-400 italic">Select a network to see postback endpoint...</span>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-text-muted">Supported Tokens</span>
                                <div className="flex flex-wrap gap-2">
                                    {currentConfig ? currentConfig.tokens.map((token) => (
                                        <span key={token} className="inline-flex items-center rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-400 ring-1 ring-inset ring-green-500/20">{token}</span>
                                    )) : (
                                        <>
                                            <span className="inline-flex items-center rounded-md bg-gray-200 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-500">---</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Offer Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white" htmlFor="offer-name">Offer Name / ID</label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="material-symbols-outlined text-gray-400 text-[20px]">sell</span>
                            </div>
                            <input
                                className="block w-full rounded-lg border-0 py-3 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-[#111122] dark:text-white dark:ring-surface-border dark:placeholder:text-[#5e5f8a] sm:text-sm sm:leading-6 outline-none"
                                id="offer-name"
                                name="offer-name"
                                placeholder="e.g. Summer Sale Sweepstakes #402"
                                type="text"
                                value={offerName}
                                onChange={(e) => setOfferName(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-500">
                            {error}
                        </div>
                    )}

                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 border-t border-gray-200 dark:border-surface-border bg-gray-50 dark:bg-[#1e1f3a]/30 px-6 py-4 rounded-b-xl">
                    <button
                        className="rounded-lg bg-white dark:bg-[#1e1f3a] px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-surface-border hover:bg-gray-50 dark:hover:bg-[#2b2c50] transition-colors"
                        type="button"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        <span className="material-symbols-outlined text-[18px]">{isLoading ? 'hourglass_empty' : 'save'}</span>
                        {isLoading ? 'Saving...' : 'Save Campaign'}
                    </button>
                </div>

            </div>
        </div>
    );
}
