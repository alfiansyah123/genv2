import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import { useTheme } from '../context/ThemeContext';
import GeneratorNavigation from '../components/GeneratorNavigation';
import LiveTraffic from '../components/LiveTraffic';

export default function Generator() {
    const { trackerId } = useParams();
    const { isDark, toggleTheme } = useTheme();
    const [selectedNetwork, setSelectedNetwork] = useState('iMonetizeit');
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDomain, setSelectedDomain] = useState('random');
    const [generatedUrl, setGeneratedUrl] = useState('');
    const [branchKey, setBranchKey] = useState('');
    const [branchEnabled, setBranchEnabled] = useState(false);
    const [useLandingPage, setUseLandingPage] = useState(false);

    const [domains, setDomains] = useState([]);

    // Fetch campaigns and domains from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Campaigns
                const campaignsRes = await fetch(`${API_URL}/api/campaigns`);
                if (campaignsRes.ok) {
                    const data = await campaignsRes.json();
                    setCampaigns(data);
                }

                // Fetch Domains
                const domainsRes = await fetch(`${API_URL}/api/addon-domains`);
                if (domainsRes.ok) {
                    const data = await domainsRes.json();
                    if (Array.isArray(data)) {
                        setDomains(data);
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filter campaigns by selected network
    const filteredCampaigns = campaigns.filter(c => c.network === selectedNetwork);

    // When network changes, auto-select first campaign for that network
    useEffect(() => {
        const networkCampaigns = campaigns.filter(c => c.network === selectedNetwork);
        if (networkCampaigns.length > 0) {
            setSelectedCampaign(networkCampaigns[0]);
        } else {
            setSelectedCampaign(null);
        }
        setGeneratedUrl(''); // Clear generated URL when network changes
    }, [selectedNetwork, campaigns]);

    // Helper to generate random Click ID (simulating the example format)
    const generateClickId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        // Generating a 32-char random string similar to the user's example
        for (let i = 0; i < 32; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const handleGenerate = async () => {
        if (!selectedCampaign) {
            alert('No campaign found for this network. Please create one first.');
            return;
        }

        if (!selectedDomain || selectedDomain === 'Select Global Domain...' || selectedDomain === 'Select Custom Domain...') {
            alert('Please select a domain first.');
            return;
        }

        setIsLoading(true);

        try {
            // Generate Unique Click ID (Slug)
            const clickId = generateClickId();

            // Prepare Payload for Backend
            // Use offerName as the Target URL (User pastes the real smartlink here)
            // Inject sub_id (Tracker Name) here as it is static for this link.
            let resolvedTargetUrl = selectedCampaign.offerName;

            // Safety check: if offerName is not a URL, fallback to template or warn?
            // User instruction is strict: "smartlink asli dimasukan ke form offer name".
            // So we assume offerName IS the URL.

            resolvedTargetUrl = resolvedTargetUrl.replace('{sub_id}', trackerId);

            // Resolve Domain (Handle Random)
            let finalDomain = selectedDomain;
            if (selectedDomain === 'random') {
                const activeDomains = domains.filter(d => d.status === 'Active');
                if (activeDomains.length > 0) {
                    const randomIdx = Math.floor(Math.random() * activeDomains.length);
                    finalDomain = activeDomains[randomIdx].title;
                } else {
                    alert('No active domains available for random selection.');
                    setIsLoading(false);
                    return;
                }
            }

            const payload = {
                slug: clickId,
                targetUrl: resolvedTargetUrl,
                domain: finalDomain,
                trackerId: trackerId,
                network: selectedNetwork,
                branchKey: branchEnabled && branchKey ? branchKey : null,
                useLandingPage: useLandingPage
            };

            // Call API to save the link
            const response = await fetch(`${API_URL}/api/links`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Failed to save link');
            }

            const data = await response.json();

            // Use the URL returned by backend (Branch link or Local link)
            setGeneratedUrl(data.generatedUrl || `https://${finalDomain}/${clickId}`);

        } catch (error) {
            console.error('Error generating link:', error);
            alert('Failed to generate link. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`font-display flex flex-col min-h-screen overflow-y-auto transition-colors ${isDark ? 'bg-background-dark text-white' : 'bg-gray-50 text-gray-900'}`}>

            <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 pt-16">
                <div className="w-full space-y-8">

                    {/* Main Interaction Area */}
                    <div className="space-y-8">

                        {/* Generator Hub Card */}
                        <div className={`relative overflow-hidden rounded-[2rem] border transition-all duration-500 ${isDark
                            ? 'bg-[#1e1e2d] border-[#2d2d42] shadow-2xl shadow-black/40'
                            : 'bg-white border-gray-300 shadow-xl shadow-gray-200/50'
                            }`}>

                            {/* Ambient Background Glow */}
                            {isDark && (
                                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
                            )}

                            <div className="p-8 md:p-10 relative">

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

                                {/* Section 2: Network Selection */}
                                <div className="mb-10">
                                    <label className={`block text-xs font-bold tracking-wider uppercase mb-4 pl-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                                        Select Network
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {['iMonetizeit', 'Lospollos', 'Clickdealer', 'Trafee'].map((network) => (
                                            <button
                                                key={network}
                                                onClick={() => setSelectedNetwork(network)}
                                                className={`group relative py-3 px-2 rounded-xl transition-all duration-300 overflow-hidden ${selectedNetwork === network
                                                    ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#1e1e2d]'
                                                    : 'hover:bg-gray-50 dark:hover:bg-[#25263a]'
                                                    } ${isDark ? 'bg-[#15162e] border border-[#2d2d42]' : 'bg-gray-50 border border-transparent'}`}
                                            >
                                                {selectedNetwork === network && (
                                                    <div className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-500/20"></div>
                                                )}
                                                <span className={`relative text-sm font-semibold transition-colors ${selectedNetwork === network
                                                    ? 'text-indigo-600 dark:text-indigo-300'
                                                    : isDark ? 'text-slate-400' : 'text-gray-600'
                                                    }`}>
                                                    {network}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Section 3: Configuration Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">

                                    {/* Domain Select */}
                                    <div className="space-y-3">
                                        <label className={`text-xs font-bold tracking-wider uppercase pl-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Domain</label>
                                        <div className="relative group">
                                            <select
                                                className={`w-full appearance-none rounded-xl border px-5 py-4 pr-12 text-sm font-medium outline-none transition-all duration-300 cursor-pointer ${isDark
                                                    ? 'bg-[#15162e] border-[#323367] text-white focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)]'
                                                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)]'
                                                    }`}
                                                value={selectedDomain}
                                                onChange={(e) => setSelectedDomain(e.target.value)}
                                            >
                                                <option value="">Select Domain...</option>
                                                <option value="random">Random Domain</option>
                                                {domains.map(domain => (
                                                    <option key={domain.dbId} value={domain.title}>
                                                        {domain.title} {domain.status !== 'Active' ? `(${domain.status})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                                                <span className="material-symbols-outlined">expand_more</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Custom Domain Placeholder */}
                                    <div className="space-y-3">
                                        <label className={`text-xs font-bold tracking-wider uppercase pl-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Custom Domain</label>
                                        <div className="relative group opacity-60 hover:opacity-100 transition-opacity">
                                            <select className={`w-full appearance-none rounded-xl border px-5 py-4 pr-12 text-sm font-medium outline-none transition-all duration-300 cursor-pointer ${isDark
                                                ? 'bg-[#15162e] border-[#323367] text-white'
                                                : 'bg-gray-50 border-gray-200 text-gray-900'
                                                }`}>
                                                <option>None</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                                <span className="material-symbols-outlined">expand_more</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 4: Advanced Params */}
                                <div className={`rounded-xl p-5 mb-10 transition-colors ${isDark ? 'bg-[#15162e]' : 'bg-gray-50'}`}>
                                    <div className="flex items-center gap-2 mb-6">
                                        <span className="material-symbols-outlined text-indigo-500 text-[20px]">tune</span>
                                        <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Advanced Parameters</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className={`block text-xs font-bold tracking-wider uppercase mb-2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Canonical URL</label>
                                            <input
                                                type="text"
                                                placeholder="{canonical_URL}"
                                                className={`w-full px-4 py-3 rounded-lg border-none text-sm font-medium transition-all ${isDark ? 'bg-[#1e1e2d] text-white placeholder-slate-600 focus:bg-[#25263a]' : 'bg-white text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-gray-200'
                                                    }`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-bold tracking-wider uppercase mb-2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Branch Key</label>
                                            <input
                                                type="text"
                                                value={branchKey}
                                                onChange={(e) => setBranchKey(e.target.value)}
                                                placeholder="e.g. key_live_..."
                                                className={`w-full px-4 py-3 rounded-lg border-none text-sm font-medium transition-all ${isDark ? 'bg-[#1e1e2d] text-white placeholder-slate-600 focus:bg-[#25263a]' : 'bg-white text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-gray-200'
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Action Bar - Form Style */}
                                <div className={`flex flex-col md:flex-row items-stretch md:items-center gap-2 p-2 rounded-xl border ${isDark
                                    ? 'bg-[#15162e] border-[#323367]'
                                    : 'bg-gray-50 border-gray-200'
                                    }`}>

                                    {/* Link Input Group */}
                                    <div className="flex items-center gap-2 flex-grow w-full md:w-auto">
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0 ${isDark ? 'bg-[#1e1e2d] text-indigo-400' : 'bg-white text-indigo-500'}`}>
                                            <span className="material-symbols-outlined text-[20px]">link</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={generatedUrl}
                                            readOnly
                                            placeholder="{shorturl}"
                                            onClick={() => generatedUrl && navigator.clipboard.writeText(generatedUrl)}
                                            className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium border-none outline-none cursor-pointer ${isDark
                                                ? 'bg-transparent text-white placeholder-slate-500'
                                                : 'bg-transparent text-gray-900 placeholder-gray-400'
                                                } ${generatedUrl ? 'text-green-500' : ''}`}
                                        />
                                    </div>

                                    {/* Action Group (Dropdowns + Button) */}
                                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                        {/* Branch Dropdown */}
                                        <select
                                            value={branchEnabled ? 'on' : 'off'}
                                            onChange={(e) => setBranchEnabled(e.target.value === 'on')}
                                            className={`w-full sm:w-auto px-3 py-2.5 rounded-lg text-sm font-medium border outline-none cursor-pointer ${isDark
                                                ? 'bg-[#1e1e2d] border-[#323367] text-white'
                                                : 'bg-white border-gray-200 text-gray-900'
                                                }`}>
                                            <option value="off">Branch OFF</option>
                                            <option value="on">Branch ON</option>
                                        </select>

                                        {/* Landing Page Dropdown */}
                                        <select
                                            value={useLandingPage ? 'landing' : 'no-landing'}
                                            onChange={(e) => setUseLandingPage(e.target.value === 'landing')}
                                            className={`w-full sm:w-auto px-3 py-2.5 rounded-lg text-sm font-medium border outline-none cursor-pointer ${isDark
                                                ? 'bg-[#1e1e2d] border-[#323367] text-white'
                                                : 'bg-white border-gray-200 text-gray-900'
                                                }`}>
                                            <option value="no-landing">No Landing Page</option>
                                            <option value="landing">Landing Page</option>
                                        </select>

                                        {/* Short URL Button */}
                                        <button
                                            onClick={handleGenerate}
                                            disabled={isLoading}
                                            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${isLoading
                                                ? 'opacity-70 cursor-not-allowed'
                                                : 'hover:opacity-90'
                                                } ${isDark
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-indigo-600 text-white'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                            {isLoading ? 'Processing...' : 'Generate'}
                                        </button>
                                    </div>

                                </div>
                            </div>



                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
