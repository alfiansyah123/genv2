import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST /api/links - Create a new short link
router.post('/', async (req, res) => {
    try {
        const { slug, targetUrl, domain, trackerId, network, ogImage, ogTitle, ogDescription, useLandingPage, branchKey } = req.body;

        const link = await prisma.link.create({
            data: {
                slug,
                targetUrl,
                domain,
                trackerId,
                network,
                useLandingPage: useLandingPage || false,
                ogImage,
                ogTitle,
                ogDescription
            }
        });

        // Construct Local Short Link (Base for Branch)
        const localProtocol = req.protocol || 'http';
        // Use provided domain from frontend if available, otherwise fallback to host
        const targetHost = domain || req.get('host');
        const localShortUrl = `${localProtocol}://${targetHost}/${slug}`;

        let finalGeneratedUrl = localShortUrl; // Default to local

        // --- BRANCH.IO INTEGRATION ---
        if (branchKey) {
            try {
                const branchApiUrl = 'https://api2.branch.io/v1/url';
                const branchPayload = {
                    branch_key: branchKey,
                    data: {
                        '$canonical_url': localShortUrl,
                        '$og_title': ogTitle || 'Check this out!',
                        '$og_description': ogDescription || 'Click to see more!',
                        '$og_image_url': ogImage || '',
                        '$desktop_url': localShortUrl,
                        '$android_url': localShortUrl,
                        '$ios_url': localShortUrl,
                        '~feature': 'marketing',
                        '~channel': network || 'direct',
                        '~campaign': trackerId
                    }
                };

                const branchRes = await fetch(branchApiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(branchPayload)
                });

                if (branchRes.ok) {
                    const branchData = await branchRes.json();
                    if (branchData.url) {
                        finalGeneratedUrl = branchData.url;
                        console.log('Branch Link Generated:', finalGeneratedUrl);
                    }
                } else {
                    console.error('Branch API Error:', await branchRes.text());
                }
            } catch (err) {
                console.error('Branch Integration Failed:', err);
            }
        }

        res.json({ success: true, link, generatedUrl: finalGeneratedUrl });
    } catch (error) {
        console.error('Error creating link:', error);
        res.status(500).json({ error: 'Failed to create link' });
    }
});

export default router;

