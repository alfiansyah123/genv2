import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useParams, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import GeneratorNavigation from '../components/GeneratorNavigation';

export default function BulkUrl() {
    const { trackerId } = useParams();
    const { isDark, toggleTheme } = useTheme();

    const [domains, setDomains] = useState([]);
    const [selectedNetwork, setSelectedNetwork] = useState('');
    const [selectedDomain, setSelectedDomain] = useState('trck.link'); // Default fallback

    // Bulk Generation States
    const [inputUrls, setInputUrls] = useState('');
    const [generatedResults, setGeneratedResults] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [numberOfLinks, setNumberOfLinks] = useState(1);

    const [campaigns, setCampaigns] = useState([]);

    // Fetch domains and campaigns from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Domains
                const domainsRes = await fetch('/api/addon-domains');
                if (domainsRes.ok) {
                    const data = await domainsRes.json();
                    if (Array.isArray(data)) {
                        setDomains(data);
                        // Auto-select first active domain
                        const activeDomain = data.find(d => d.status === 'Active');
                        if (activeDomain) {
                            setSelectedDomain(activeDomain.title);
                        }
                    }
                }

                // Fetch Campaigns (for dynamic network list)
                const campaignsRes = await fetch('/api/campaigns');
                if (campaignsRes.ok) {
                    const data = await campaignsRes.json();
                    setCampaigns(data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    // Extract unique networks from campaigns
    const availableNetworks = [...new Set(campaigns.map(c => c.network))];
    // Fallback if no campaigns
    const networkOptions = availableNetworks.length > 0 ? availableNetworks : ['iMonetizeit', 'Lospollos', 'Clickdealer', 'Trafee'];

    // Auto-select first network if available and none selected
    useEffect(() => {
        if (!selectedNetwork && networkOptions.length > 0) {
            setSelectedNetwork(networkOptions[0]);
        }
    }, [networkOptions, selectedNetwork]);

    // Helper to generate random Click ID (copied from Generator.jsx)
    const generateClickId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 32; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        const lineCount = val.split(/\r\n|\r|\n/).length;
        if (lineCount <= 100) {
            setInputUrls(val);
        }
    };

    const handleClear = () => {
        setInputUrls('');
        setGeneratedResults([]);
        setProgress({ current: 0, total: 0 });
    };

    const handleLoadExample = () => {
        const examples = [
            'https://example.com/offer-1',
            'https://example.com/offer-2',
            'https://example.com/offer-3',
            'https://example.com/cool-game',
            'https://example.com/dating-offer'
        ].join('\n');
        setInputUrls(examples);
    };

    const handleGenerate = async () => {
        if (!selectedNetwork) {
            alert('Please select a Target Network.');
            return;
        }

        // Find campaign for selected network
        const networkCampaign = campaigns.find(c => c.network === selectedNetwork);
        if (!networkCampaign) {
            alert('No campaign found for this network. Please create one in Campaign Management first.');
            return;
        }

        setIsGenerating(true);
        setGeneratedResults([]); // Clear previous results
        setProgress({ current: 0, total: numberOfLinks });

        const allProcessedResults = [];

        // Generate numberOfLinks links using the campaign's offerName
        for (let i = 0; i < numberOfLinks; i++) {
            const clickId = generateClickId();
            let targetUrl = networkCampaign.offerName;

            try {
                // 1. Replace {sub_id} with actual trackerId
                if (trackerId) {
                    targetUrl = targetUrl.replace('{sub_id}', trackerId);
                }

                // 2. Auto-prepend https if missing protocol
                if (!/^https?:\/\//i.test(targetUrl)) {
                    targetUrl = 'https://' + targetUrl;
                }

                // 3. Resolve Domain
                let finalDomain = selectedDomain;
                if (selectedDomain === 'random') {
                    const activeDomains = domains.filter(d => d.status === 'Active');
                    if (activeDomains.length > 0) {
                        const randomIdx = Math.floor(Math.random() * activeDomains.length);
                        finalDomain = activeDomains[randomIdx].title;
                    } else {
                        throw new Error('No active domains found');
                    }
                }

                // 4. Validate URL
                new URL(targetUrl);

                const payload = {
                    slug: clickId,
                    targetUrl: targetUrl,
                    domain: finalDomain,
                    trackerId: trackerId,
                    network: selectedNetwork
                };

                const response = await fetch('/api/links', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    allProcessedResults.push({
                        original: targetUrl,
                        shortLink: `https://${finalDomain}/${clickId}`,
                        status: 'Active',
                        error: null
                    });
                } else {
                    throw new Error('API Error');
                }

            } catch (error) {
                allProcessedResults.push({
                    original: targetUrl,
                    shortLink: null,
                    status: 'Error',
                    error: 'Failed'
                });
            }

            setGeneratedResults([...allProcessedResults]);
            setProgress(prev => ({ ...prev, current: i + 1 }));
        }

        setIsGenerating(false);
    };

    const handleCopyAll = () => {
        if (generatedResults.length === 0) return;
        const allLinks = generatedResults
            .filter(r => !r.error)
            .map(r => r.shortLink)
            .join('\n');
        navigator.clipboard.writeText(allLinks);
        alert('All active links copied to clipboard!');
    };

    const handleDownloadCSV = () => {
        if (generatedResults.length === 0) return;
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Original URL,Short Link,Status\n"
            + generatedResults.map(r => `"${r.original}","${r.shortLink || ''}","${r.status}"`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `bulk_links_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset everything?')) {
            handleClear();
            setSelectedNetwork('');
            // setSelectedDomain('trck.link'); // Optional: reset domain too
        }
    };

    return (
        <div className={`font-display flex flex-col min-h-screen overflow-y-auto transition-colors ${isDark ? 'bg-background-dark text-white' : 'bg-gray-50 text-gray-900'}`}>


            <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-16 flex flex-col gap-6">

                {/* Configuration Panel */}
                <div className="w-full space-y-8">
                    <div className="space-y-8">
                        {/* Settings Card */}
                        <div className={`rounded-[2rem] p-8 shadow-2xl border transition-all duration-500 overflow-hidden relative ${isDark
                            ? 'bg-[#1e1e2d] border-[#2d2d42] shadow-black/40'
                            : 'bg-white border-gray-300 shadow-gray-200/50'
                            }`}>
                            {/* Ambient Background Glow */}
                            {isDark && (
                                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
                            )}

                            <div className="relative">
                                {/* Logo Banner */}
                                <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
                                    <img
                                        src="/logo.png"
                                        alt="Banner"
                                        className="w-full h-auto object-cover"
                                    />
                                </div>

                                {/* Navigation & Tracker ID */}
                                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
                                    <GeneratorNavigation />

                                    <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border ${isDark
                                        ? 'bg-[#16172b] border-[#323367] text-indigo-300'
                                        : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                                        }`}>
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-sm font-semibold tracking-wide uppercase">Tracker: {trackerId}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <label className="flex flex-col gap-3">
                                        <span className={`text-xs font-bold tracking-wider uppercase pl-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Target Network</span>
                                        <div className="relative group">
                                            <select
                                                value={selectedNetwork}
                                                onChange={(e) => setSelectedNetwork(e.target.value)}
                                                className={`w-full appearance-none rounded-xl border px-5 py-4 pr-12 text-sm font-medium outline-none transition-all duration-300 cursor-pointer ${isDark
                                                    ? 'bg-[#15162e] border-[#323367] text-white focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)]'
                                                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)]'
                                                    }`}
                                            >
                                                <option value="" disabled>Select Network...</option>
                                                {networkOptions.map((network) => (
                                                    <option key={network} value={network}>{network}</option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                                <span className="material-symbols-outlined">expand_more</span>
                                            </div>
                                        </div>
                                    </label>
                                    <label className="flex flex-col gap-3">
                                        <span className={`text-xs font-bold tracking-wider uppercase pl-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Tracking Domain</span>
                                        <div className="relative group">
                                            <select
                                                value={selectedDomain}
                                                onChange={(e) => setSelectedDomain(e.target.value)}
                                                className={`w-full appearance-none rounded-xl border px-5 py-4 pr-12 text-sm font-medium outline-none transition-all duration-300 cursor-pointer ${isDark
                                                    ? 'bg-[#15162e] border-[#323367] text-white focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)]'
                                                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)]'
                                                    }`}
                                            >
                                                <option value="" disabled>Select Domain...</option>
                                                <option value="random">Random Domain</option>
                                                {domains.length > 0 ? (
                                                    domains.map((domain) => (
                                                        <option key={domain.dbId} value={domain.title}>
                                                            {domain.title} {domain.status !== 'Active' ? `(${domain.status})` : ''}
                                                        </option>
                                                    ))
                                                ) : (
                                                    <option value="trck.link">trck.link (Default)</option>
                                                )}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                                <span className="material-symbols-outlined">expand_more</span>
                                            </div>
                                        </div>
                                    </label>
                                    <label className="flex flex-col gap-3">
                                        <span className={`text-xs font-bold tracking-wider uppercase pl-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Number of Links</span>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={numberOfLinks}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value) || 1;
                                                setNumberOfLinks(Math.min(100, Math.max(1, val)));
                                            }}
                                            className={`w-full rounded-xl border px-5 py-4 text-sm font-medium outline-none transition-all ${isDark
                                                ? 'bg-[#15162e] border-[#323367] text-white focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)]'
                                                : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)]'
                                                }`}
                                            placeholder="1"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                        {/* Generated Output Card */}
                        <div className={`rounded-xl p-6 shadow-xl flex flex-col gap-4 flex-1 border transition-colors ${isDark ? 'bg-surface-dark border-border-dark' : 'bg-white border-gray-200'}`}>
                            <div className="flex justify-between items-center">
                                <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    <span className="material-symbols-outlined text-primary">list</span>
                                    {generatedResults.length > 0 ? 'Generated Output' : 'Ready to Generate'}
                                </h3>
                                <div className="flex items-center gap-2">
                                    {generatedResults.length > 0 && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleCopyAll}
                                                className={`p-1.5 rounded transition-colors ${isDark ? 'hover:bg-[#323367] text-[#9293c9] hover:text-white' : 'hover:bg-gray-200 text-gray-500 hover:text-gray-900'}`}
                                                title="Copy All"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                            </button>
                                            <button
                                                onClick={handleDownloadCSV}
                                                className={`p-1.5 rounded transition-colors ${isDark ? 'hover:bg-[#323367] text-[#9293c9] hover:text-white' : 'hover:bg-gray-200 text-gray-500 hover:text-gray-900'}`}
                                                title="Download CSV"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">download</span>
                                            </button>
                                            <button
                                                onClick={handleReset}
                                                className={`text-xs underline transition-colors ${isDark ? 'text-[#9293c9] hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                                            >
                                                Reset
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {generatedResults.length > 0 ? (
                                // RESULT TABLE VIEW
                                <div className="flex-1 overflow-y-auto min-h-[400px]">
                                    <table className="w-full text-left border-collapse">
                                        <thead className={`sticky top-0 z-10 transition-colors ${isDark ? 'bg-[#15162e]' : 'bg-gray-100'}`}>
                                            <tr>
                                                <th className={`p-3 text-xs font-semibold uppercase border-b ${isDark ? 'text-[#9293c9] border-[#323367]' : 'text-gray-500 border-gray-200'}`}>Original</th>
                                                <th className={`p-3 text-xs font-semibold uppercase border-b ${isDark ? 'text-[#9293c9] border-[#323367]' : 'text-gray-500 border-gray-200'}`}>Short Link</th>
                                                <th className={`p-3 text-xs font-semibold uppercase border-b w-10 ${isDark ? 'text-[#9293c9] border-[#323367]' : 'text-gray-500 border-gray-200'}`}></th>
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y ${isDark ? 'divide-[#323367]' : 'divide-gray-100'}`}>
                                            {generatedResults.map((result, idx) => (
                                                <tr key={idx} className={`group transition-colors ${isDark ? 'hover:bg-[#1e1e2d]' : 'hover:bg-gray-50'}`}>
                                                    <td className={`p-3 text-sm truncate max-w-[200px] ${isDark ? 'text-gray-300' : 'text-gray-600'}`} title={result.original}>
                                                        {result.original}
                                                    </td>
                                                    <td className="p-3">
                                                        {result.error ? (
                                                            <span className="text-red-400 text-xs">{result.error}</span>
                                                        ) : (
                                                            <a href={result.shortLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm font-medium truncate block max-w-[200px]">
                                                                {result.shortLink}
                                                            </a>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        {!result.error && (
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(result.shortLink);
                                                                }}
                                                                className={`opacity-0 group-hover:opacity-100 p-1.5 rounded transition-all ${isDark ? 'text-slate-400 hover:text-white hover:bg-[#323367]' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}
                                                                title="Copy Link"
                                                            >
                                                                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                // EMPTY STATE
                                <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] gap-4">
                                    <span className="material-symbols-outlined text-6xl text-primary/20">link</span>
                                    <div className="text-center">
                                        <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            Ready to Generate Links
                                        </p>
                                        <p className={`text-sm mt-1 ${isDark ? 'text-[#9293c9]' : 'text-gray-500'}`}>
                                            Select a network and number of links, then click Generate
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleGenerate}
                                        disabled={isGenerating}
                                        className={`bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-lg text-sm font-bold shadow-[0_0_20px_rgba(90,92,242,0.3)] transition-all transform active:scale-95 flex items-center justify-center gap-2 ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {isGenerating ? (
                                            <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                                        ) : (
                                            <span className="material-symbols-outlined text-[20px]">bolt</span>
                                        )}
                                        {isGenerating ? 'Generating...' : 'Generate Links'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
