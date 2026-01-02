import React, { useState, useRef, useEffect } from 'react';
import { API_URL } from '../config';
import { useParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import GeneratorNavigation from '../components/GeneratorNavigation';

// Sample library images
const libraryImages = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA9Efz_fNrmQmUhoOYJw7fu4w7jU79CpXwQZ9zORmnpb_-JZzuHGqwURMTqTh1MGWeSX5ZR1I3c73yCUR1Nv8DIBU7iG705NsR-EWQcLJhCtZ-Jp0ytGYBKzewFSckpFDAoqqlGL8J2SdKjn2GZEJFDMk1loGj94W70AHG7tCyXJ8REiQuPA_zTU3ehLZkSFjTfvRfG6cKiu7cVa9v-18upv6qn56q1A3DBIOROD3SzfVjc7MmD0Xog5II147VQTTDNPFGA0qwuUx0',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB1V8JdzoYySZnl1tc7PBOaxlALaG7ZRMRv6P2_WgIanqiKAH7pY0mAZvgtExjI9NjqjqnFWybiRquCjl_wTqRmf7YE2lVPj4oLFyCLTBnDAF2RhyxOxMyHS9m4B5ktbiIU0PpodxAEB82GnRZmEvDZYbRaCQcJDUmQ1GX9SaEaSHL08C0W09S_pb9uqaH_jIZqFqEeTTJUkxnUpd1u-sMGVcZz1AJCoudYdHjDccx7dM6lPNn9cQe-H2Vo_xrcf1HUtDTTgdT4KW4',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCvIJj0nIjHW9xeTuPYnDfm1JWEGMwIKjiLk2_CXHEFx3NtsF384hZtoBxH-pm1feDLX5iKDTYsBJKakdcOOm3PgKVfO1xj1a0RpbeqDFllnT6A6_VT4PPDCjCkyfmFa6xh8H47qz3sZMOBNggAXWdrQrDD2dDaYWPHn2bfnBNiHDocTVOy52T7qshb22BStqIHCUMQ6wpoqcY2ZJWlB9pMq6SM4HUXhhC5H9Pg7GSLXnhlbVTMu_jF5QcsYW8eA4gEl5890_79f9Q'
];

const badgeStyles = [
    { value: 'top-right', label: '50% OFF Badge (Top Right)', text: '50% OFF', position: 'top-4 right-4' },
    { value: 'top-left', label: 'New Arrival (Top Left)', text: 'NEW', position: 'top-4 left-4' },
    { value: 'bottom-center', label: 'Free Shipping (Bottom)', text: 'FREE SHIPPING', position: 'bottom-4 left-1/2 -translate-x-1/2' },
    { value: 'none', label: 'None', text: '', position: '' }
];

export default function ShareImage() {
    const { trackerId } = useParams();
    const { isDark, toggleTheme } = useTheme();
    const fileInputRef = useRef(null);
    const canvasRef = useRef(null);

    // State
    const [sourceType, setSourceType] = useState('Select from Library');
    const [selectedImage, setSelectedImage] = useState(libraryImages[0]);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [zoom, setZoom] = useState(100);
    const [promoText, setPromoText] = useState('Use Code: FALL23');
    const [badgeStyle, setBadgeStyle] = useState('top-right');
    const [overlayOpacity, setOverlayOpacity] = useState(90);
    const [generatedUrl, setGeneratedUrl] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [domains, setDomains] = useState([]);
    const [selectedDomain, setSelectedDomain] = useState('');
    const [ogTitle, setOgTitle] = useState('Check this out!');

    // Fetch domains on mount
    useEffect(() => {
        const fetchDomains = async () => {
            try {
                const res = await fetch(`${API_URL}/api/addon-domains`);
                if (res.ok) {
                    const data = await res.json();
                    setDomains(data);
                    if (data.length > 0) setSelectedDomain(data[0].title);
                }
            } catch (err) {
                console.error('Error fetching domains:', err);
            }
        };
        fetchDomains();
    }, []);

    // Get current badge config
    const currentBadge = badgeStyles.find(b => b.value === badgeStyle) || badgeStyles[0];

    // Zoom controls
    const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
    const handleZoomReset = () => setZoom(100);

    // File upload handler
    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Create local preview
        const reader = new FileReader();
        reader.onload = (event) => {
            const imageUrl = event.target.result;
            setUploadedImages(prev => [...prev, imageUrl]);
            setSelectedImage(imageUrl);
        };
        reader.readAsDataURL(file);

        // Upload to server
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                const data = await res.json();
                // Replace local preview with server URL
                const serverUrl = `${data.imageUrl}`;
                setSelectedImage(serverUrl);
            }
        } catch (err) {
            console.error('Upload error:', err);
        }
    };

    // Generate random slug
    const generateSlug = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    // Generate CPA Link
    const handleGenerateLink = async () => {
        if (!selectedImage) {
            alert('Please select an image first');
            return;
        }
        if (!selectedDomain) {
            alert('Please select a domain first');
            return;
        }

        setIsGenerating(true);

        try {
            const slug = generateSlug();

            // For library images, use them directly. For uploaded images, they should already be server URLs
            const ogImageUrl = selectedImage.startsWith('')
                ? selectedImage
                : selectedImage; // External URLs work too for OG

            const payload = {
                slug,
                targetUrl: `https://example.com/offer`, // Placeholder - in real use, this would link to actual offer
                domain: selectedDomain,
                trackerId: trackerId,
                network: 'ShareImage',
                ogImage: ogImageUrl,
                ogTitle: ogTitle,
                ogDescription: promoText
            };

            const res = await fetch(`${API_URL}/api/links`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const shortUrl = `https://${selectedDomain}/${slug}`;
                setGeneratedUrl(shortUrl);
            } else {
                throw new Error('Failed to create link');
            }
        } catch (err) {
            console.error('Error generating link:', err);
            alert('Failed to generate link');
        } finally {
            setIsGenerating(false);
        }
    };

    // Copy to clipboard
    const handleCopy = async () => {
        if (!generatedUrl) return;
        try {
            await navigator.clipboard.writeText(generatedUrl);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    // Download as JPG
    const handleDownload = async () => {
        if (!selectedImage) return;

        try {
            // Create a canvas to draw the image with overlays
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw image
                ctx.drawImage(img, 0, 0);

                // Draw badge overlay
                if (currentBadge.text) {
                    ctx.fillStyle = '#6366f1';
                    ctx.fillRect(img.width - 120, 20, 100, 30);
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 14px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(currentBadge.text, img.width - 70, 42);
                }

                // Draw promo text overlay
                if (promoText) {
                    const opacity = overlayOpacity / 100;
                    ctx.fillStyle = `rgba(0, 0, 0, ${opacity * 0.7})`;
                    ctx.fillRect(20, img.height - 80, 200, 60);
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 18px Arial';
                    ctx.textAlign = 'left';
                    ctx.fillText(promoText, 30, img.height - 35);
                }

                // Download
                const link = document.createElement('a');
                link.download = `shareimage-${Date.now()}.jpg`;
                link.href = canvas.toDataURL('image/jpeg', 0.9);
                link.click();
            };

            img.src = selectedImage;
        } catch (err) {
            console.error('Download error:', err);
            alert('Failed to download image');
        }
    };

    // Share
    const handleShare = async () => {
        if (!generatedUrl) {
            alert('Please generate a link first');
            return;
        }

        if (navigator.share) {
            try {
                await navigator.share({
                    title: ogTitle,
                    text: promoText,
                    url: generatedUrl
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Share failed:', err);
                }
            }
        } else {
            // Fallback to copy
            handleCopy();
            alert('Link copied to clipboard!');
        }
    };

    return (
        <div className={`font-display flex flex-col min-h-screen overflow-y-auto transition-colors ${isDark ? 'bg-background-dark text-white' : 'bg-gray-50 text-gray-900'}`}>
            <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors ${isDark ? 'bg-[#15162e]/90 border-[#323367]' : 'bg-white/90 border-gray-200'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 relative">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                <span className="material-symbols-outlined text-white text-[20px]">link</span>
                            </div>
                            <span className={`font-bold text-lg tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>CPA LinkGen</span>
                        </div>
                        <button onClick={toggleTheme} className={`transition-colors ${isDark ? 'text-[#9293c9] hover:text-white' : 'text-gray-500 hover:text-gray-900'}`} title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                            <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="layout-container flex flex-col flex-1">
                <GeneratorNavigation />
                <div className="flex flex-1 justify-center py-5 px-4 md:px-8">
                    <div className="layout-content-container flex flex-col w-full max-w-[1280px] flex-1">

                        {/* Main Grid Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full pb-8">
                            {/* Left Column: Canvas / Preview */}
                            <div className="lg:col-span-8 flex flex-col gap-4">
                                <div className={`rounded-xl border shadow-sm h-full min-h-[500px] flex flex-col overflow-hidden transition-colors ${isDark ? 'bg-surface-dark border-surface-border' : 'bg-white border-gray-200'}`}>
                                    {/* Toolbar for Canvas */}
                                    <div className={`flex items-center justify-between px-4 py-3 border-b transition-colors ${isDark ? 'border-surface-border bg-[#15162b]' : 'border-gray-100 bg-gray-50'}`}>
                                        <span className={`font-medium text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            <span className="material-symbols-outlined text-primary text-[20px]">image</span>
                                            Preview Canvas
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button onClick={handleZoomOut} className={`p-1.5 rounded transition-colors ${isDark ? 'text-[#9293c9] hover:text-white hover:bg-surface-border' : 'text-gray-400 hover:text-gray-900 hover:bg-white'}`} title="Zoom Out">
                                                <span className="material-symbols-outlined text-[20px]">remove</span>
                                            </button>
                                            <span className={`text-xs font-mono min-w-[40px] text-center ${isDark ? 'text-[#9293c9]' : 'text-gray-500'}`}>{zoom}%</span>
                                            <button onClick={handleZoomIn} className={`p-1.5 rounded transition-colors ${isDark ? 'text-[#9293c9] hover:text-white hover:bg-surface-border' : 'text-gray-400 hover:text-gray-900 hover:bg-white'}`} title="Zoom In">
                                                <span className="material-symbols-outlined text-[20px]">add</span>
                                            </button>
                                            <div className={`w-px h-4 mx-1 ${isDark ? 'bg-surface-border' : 'bg-gray-200'}`}></div>
                                            <button onClick={handleZoomReset} className={`p-1.5 rounded transition-colors ${isDark ? 'text-[#9293c9] hover:text-white hover:bg-surface-border' : 'text-gray-400 hover:text-gray-900 hover:bg-white'}`} title="Fit to Screen">
                                                <span className="material-symbols-outlined text-[20px]">aspect_ratio</span>
                                            </button>
                                        </div>
                                    </div>
                                    {/* Main Image Area */}
                                    <div ref={canvasRef} className={`flex-1 relative rounded-b-lg overflow-hidden flex items-center justify-center p-8 group/canvas transition-colors ${isDark ? 'bg-[#0c0d1c]' : 'bg-gray-100'}`}>
                                        {/* Background Pattern */}
                                        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `radial-gradient(${isDark ? '#232448' : '#e2e2e8'} 1px, transparent 1px)`, backgroundSize: '20px 20px' }}></div>
                                        {/* The Image */}
                                        <div className="relative max-w-full max-h-full shadow-2xl transition-transform" style={{ transform: `scale(${zoom / 100})` }}>
                                            {selectedImage ? (
                                                <>
                                                    <img alt="Preview" className="rounded-lg max-h-[600px] w-auto object-contain block" src={selectedImage} />
                                                    {/* Badge Overlay */}
                                                    {currentBadge.text && (
                                                        <div className={`absolute ${currentBadge.position} bg-primary text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg`}>
                                                            {currentBadge.text}
                                                        </div>
                                                    )}
                                                    {/* Promo Text Overlay */}
                                                    {promoText && (
                                                        <div
                                                            className="absolute bottom-6 left-6 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-white/10"
                                                            style={{ opacity: overlayOpacity / 100 }}
                                                        >
                                                            <p className="text-xs text-gray-300 uppercase font-semibold">Limited Time</p>
                                                            <p className="text-lg font-bold">{promoText}</p>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className={`flex flex-col items-center gap-4 ${isDark ? 'text-[#9293c9]' : 'text-gray-400'}`}>
                                                    <span className="material-symbols-outlined text-6xl">add_photo_alternate</span>
                                                    <p className="text-sm">Select or upload an image</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Tools & Actions */}
                            <div className="lg:col-span-4 flex flex-col gap-6">
                                {/* Tool Panel */}
                                <div className={`rounded-xl border flex flex-col overflow-hidden shadow-sm transition-colors ${isDark ? 'bg-surface-dark border-surface-border' : 'bg-white border-gray-200'}`}>
                                    {/* Tabs */}
                                    <div className={`p-4 border-b transition-colors ${isDark ? 'border-surface-border bg-[#15162b]' : 'border-gray-100 bg-gray-50'}`}>
                                        <div className={`flex h-10 w-full items-center justify-center rounded-lg p-1 transition-colors ${isDark ? 'bg-background-dark' : 'bg-gray-100'}`}>
                                            <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-[4px] px-2 has-[:checked]:bg-primary has-[:checked]:text-white text-[#9293c9] text-sm font-medium leading-normal transition-all">
                                                <span className="truncate flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">upload_file</span> Upload</span>
                                                <input className="invisible w-0 h-0 absolute" name="source-type" type="radio" value="Upload New" onChange={() => setSourceType('Upload New')} checked={sourceType === 'Upload New'} />
                                            </label>
                                            <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-[4px] px-2 has-[:checked]:bg-primary has-[:checked]:text-white text-[#9293c9] text-sm font-medium leading-normal transition-all">
                                                <span className="truncate flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">grid_view</span> Library</span>
                                                <input className="invisible w-0 h-0 absolute" name="source-type" type="radio" value="Select from Library" onChange={() => setSourceType('Select from Library')} checked={sourceType === 'Select from Library'} />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="p-5 flex flex-col gap-6">
                                        {/* Image Source Gallery */}
                                        <div className="flex flex-col gap-3">
                                            <div className="flex justify-between items-center">
                                                <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-[#9293c9]' : 'text-gray-500'}`}>Select Base Image</label>
                                                <span className="text-primary text-xs font-medium">View All</span>
                                            </div>
                                            <div className="grid grid-cols-4 gap-2">
                                                {/* Library Images */}
                                                {libraryImages.map((img, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setSelectedImage(img)}
                                                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === img
                                                            ? 'border-primary ring-2 ring-primary/20'
                                                            : isDark ? 'border-surface-border opacity-70 hover:opacity-100' : 'border-gray-200 opacity-70 hover:opacity-100'
                                                            }`}
                                                    >
                                                        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url("${img}")` }}></div>
                                                    </button>
                                                ))}
                                                {/* Upload Button */}
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className={`relative aspect-square rounded-lg overflow-hidden border border-dashed flex items-center justify-center transition-colors ${isDark ? 'border-surface-border bg-background-dark hover:bg-[#1f2038] text-[#9293c9]' : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-400'}`}
                                                >
                                                    <span className="material-symbols-outlined">add</span>
                                                </button>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleFileUpload}
                                                />
                                            </div>
                                            {/* Show uploaded images */}
                                            {uploadedImages.length > 0 && (
                                                <div className="grid grid-cols-4 gap-2 mt-2">
                                                    {uploadedImages.map((img, idx) => (
                                                        <button
                                                            key={`uploaded-${idx}`}
                                                            onClick={() => setSelectedImage(img)}
                                                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === img
                                                                ? 'border-primary ring-2 ring-primary/20'
                                                                : isDark ? 'border-surface-border opacity-70 hover:opacity-100' : 'border-gray-200 opacity-70 hover:opacity-100'
                                                                }`}
                                                        >
                                                            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url("${img}")` }}></div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className={`h-px w-full ${isDark ? 'bg-surface-border' : 'bg-gray-100'}`}></div>

                                        {/* Customization Controls */}
                                        <div className="flex flex-col gap-4">
                                            <h3 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                <span className="material-symbols-outlined text-[18px] text-primary">tune</span> Overlays & Text
                                            </h3>

                                            {/* OG Title */}
                                            <div className="flex flex-col gap-1.5">
                                                <label className={`text-xs font-medium ${isDark ? 'text-[#9293c9]' : 'text-gray-500'}`}>OG Title (Social Preview)</label>
                                                <input
                                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all ${isDark ? 'bg-background-dark border-surface-border text-white focus:border-primary placeholder-gray-600' : 'bg-gray-100 border-gray-200 text-gray-900 focus:border-primary placeholder-gray-400'}`}
                                                    type="text"
                                                    value={ogTitle}
                                                    onChange={(e) => setOgTitle(e.target.value)}
                                                />
                                            </div>

                                            {/* Promo Text */}
                                            <div className="flex flex-col gap-1.5">
                                                <label className={`text-xs font-medium ${isDark ? 'text-[#9293c9]' : 'text-gray-500'}`}>Promo Text</label>
                                                <div className="relative">
                                                    <input
                                                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all ${isDark ? 'bg-background-dark border-surface-border text-white focus:border-primary placeholder-gray-600' : 'bg-gray-100 border-gray-200 text-gray-900 focus:border-primary placeholder-gray-400'}`}
                                                        type="text"
                                                        value={promoText}
                                                        onChange={(e) => setPromoText(e.target.value)}
                                                    />
                                                    <span className={`absolute right-3 top-2 cursor-pointer transition-colors ${isDark ? 'text-[#9293c9] hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}>
                                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Badge Style */}
                                            <div className="flex flex-col gap-1.5">
                                                <label className={`text-xs font-medium ${isDark ? 'text-[#9293c9]' : 'text-gray-500'}`}>Badge Style</label>
                                                <div className="relative">
                                                    <select
                                                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer transition-all ${isDark ? 'bg-background-dark border-surface-border text-white focus:border-primary' : 'bg-gray-100 border-gray-200 text-gray-900 focus:border-primary'}`}
                                                        value={badgeStyle}
                                                        onChange={(e) => setBadgeStyle(e.target.value)}
                                                    >
                                                        {badgeStyles.map(style => (
                                                            <option key={style.value} value={style.value}>{style.label}</option>
                                                        ))}
                                                    </select>
                                                    <span className={`absolute right-3 top-2.5 pointer-events-none ${isDark ? 'text-[#9293c9]' : 'text-gray-400'}`}>
                                                        <span className="material-symbols-outlined text-[18px]">expand_more</span>
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Opacity Slider */}
                                            <div className="flex flex-col gap-2 pt-2">
                                                <div className="flex justify-between items-center">
                                                    <label className={`text-xs font-medium ${isDark ? 'text-[#9293c9]' : 'text-gray-500'}`}>Overlay Opacity</label>
                                                    <span className={`text-xs font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{overlayOpacity}%</span>
                                                </div>
                                                <input
                                                    className={`w-full h-1 rounded-lg appearance-none cursor-pointer transition-colors ${isDark ? 'bg-surface-border' : 'bg-gray-200'}`}
                                                    max="100"
                                                    min="0"
                                                    type="range"
                                                    value={overlayOpacity}
                                                    onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                                                />
                                            </div>

                                            {/* Domain Selection */}
                                            <div className="flex flex-col gap-1.5">
                                                <label className={`text-xs font-medium ${isDark ? 'text-[#9293c9]' : 'text-gray-500'}`}>Domain</label>
                                                <div className="relative">
                                                    <select
                                                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer transition-all ${isDark ? 'bg-background-dark border-surface-border text-white focus:border-primary' : 'bg-gray-100 border-gray-200 text-gray-900 focus:border-primary'}`}
                                                        value={selectedDomain}
                                                        onChange={(e) => setSelectedDomain(e.target.value)}
                                                    >
                                                        {domains.map(d => (
                                                            <option key={d.dbId} value={d.title}>{d.title}</option>
                                                        ))}
                                                    </select>
                                                    <span className={`absolute right-3 top-2.5 pointer-events-none ${isDark ? 'text-[#9293c9]' : 'text-gray-400'}`}>
                                                        <span className="material-symbols-outlined text-[18px]">expand_more</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions Footer */}
                                    <div className={`p-5 border-t flex flex-col gap-4 transition-colors ${isDark ? 'bg-[#15162b] border-surface-border' : 'bg-gray-50 border-gray-100'}`}>
                                        <button
                                            onClick={handleGenerateLink}
                                            disabled={isGenerating}
                                            className="w-full bg-primary hover:bg-[#4a4ce6] text-white font-medium py-2.5 px-4 rounded-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-50"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">{isGenerating ? 'hourglass_empty' : 'link'}</span>
                                            {isGenerating ? 'Generating...' : 'Generate CPA Link'}
                                        </button>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className={`material-symbols-outlined text-[18px] ${isDark ? 'text-[#9293c9]' : 'text-gray-400'}`}>link</span>
                                            </div>
                                            <input
                                                className={`w-full pl-10 pr-10 border rounded-lg py-2 text-sm select-all font-mono transition-colors ${isDark ? 'bg-background-dark border-surface-border text-[#9293c9]' : 'bg-white border-gray-200 text-gray-500'}`}
                                                readOnly
                                                type="text"
                                                value={generatedUrl || 'Generate a link first...'}
                                            />
                                            <button onClick={handleCopy} className="absolute inset-y-0 right-0 pr-2 flex items-center">
                                                <span className={`material-symbols-outlined cursor-pointer text-[18px] p-1 rounded transition-colors ${copySuccess ? 'text-green-500' : isDark ? 'text-[#9293c9] hover:text-white hover:bg-surface-border' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}>
                                                    {copySuccess ? 'check' : 'content_copy'}
                                                </span>
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={handleDownload}
                                                className={`flex-1 text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${isDark ? 'bg-surface-border hover:bg-[#2d2e5c] text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                                            >
                                                <span className="material-symbols-outlined text-[18px]">download</span>
                                                Download JPG
                                            </button>
                                            <button
                                                onClick={handleShare}
                                                className={`size-9 rounded-lg transition-colors flex items-center justify-center ${isDark ? 'bg-surface-border hover:bg-[#2d2e5c] text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                                                title="Share directly"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">share</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Tip Card */}
                                    <div className={`p-4 rounded-xl border transition-colors ${isDark ? 'bg-gradient-to-br from-surface-dark to-[#15162b] border-surface-border' : 'bg-white border-gray-200 shadow-sm'}`}>
                                        <div className="flex items-start gap-3">
                                            <div className="bg-primary/20 p-2 rounded-lg text-primary">
                                                <span className="material-symbols-outlined text-[20px]">tips_and_updates</span>
                                            </div>
                                            <div>
                                                <h4 className={`text-sm font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Pro Tip</h4>
                                                <p className={`text-xs leading-relaxed ${isDark ? 'text-[#9293c9]' : 'text-gray-500'}`}>
                                                    When you share the generated link on social media, your custom image will appear as the preview. This works on Facebook, Twitter, WhatsApp, and more!
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
