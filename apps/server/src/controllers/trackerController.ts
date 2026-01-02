import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createTracker = async (req: Request, res: Response) => {
    try {
        const { name, team, password, slug } = req.body;

        // Basic validation
        if (!name || !slug) {
            return res.status(400).json({ error: 'Name and Slug are required' });
        }

        const existingTracker = await prisma.tracker.findUnique({
            where: { slug },
        });

        if (existingTracker) {
            return res.status(400).json({ error: 'Slug already taken' });
        }

        const tracker = await prisma.tracker.create({
            data: {
                name,
                team: team || 'USER',
                password,
                slug,
                targetUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/${slug}` // Auto-generate target URL
            },
        });

        res.status(201).json(tracker);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create tracker' });
    }
};

export const getTrackers = async (req: Request, res: Response) => {
    try {
        const trackers = await prisma.tracker.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(trackers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch trackers' });
    }
};

export const deleteTracker = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.tracker.delete({
            where: { id: Number(id) }
        });
        res.json({ message: 'Tracker deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete tracker' });
    }
};

export const updateTracker = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, team, password, slug } = req.body;

        const tracker = await prisma.tracker.update({
            where: { id: Number(id) },
            data: {
                name,
                team,
                password,
                // Only update slug/targetUrl if slug is provided
                ...(slug && {
                    slug,
                    targetUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/${slug}`
                })
            }
        });
        res.json(tracker);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update tracker' });
    }
};

export const checkTrackerSlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const tracker = await prisma.tracker.findUnique({
            where: { slug }
        });

        if (!tracker) {
            return res.status(404).json({ error: 'Tracker not found' });
        }

        // Return only necessary info
        res.json({
            exists: true,
            hasPassword: !!tracker.password,
            trackerId: tracker.id // Might be needed for other calls
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to check tracker' });
    }
};

export const verifyTrackerPassword = async (req: Request, res: Response) => {
    try {
        const { slug, password } = req.body;
        const tracker = await prisma.tracker.findUnique({
            where: { slug }
        });

        if (!tracker) {
            return res.status(404).json({ error: 'Tracker not found' });
        }

        if (tracker.password !== password) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        res.json({ success: true, tracker });
    } catch (error) {
        res.status(500).json({ error: 'Verification failed' });
    }
};
