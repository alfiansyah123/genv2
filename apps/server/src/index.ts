console.log('Starting server...');
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import serverless from 'serverless-http';
import { PrismaClient } from '@prisma/client';
import { initWebSocket } from './websocket';

dotenv.config();

import trackerRoutes from './routes/trackerRoutes';
import campaignRoutes from './routes/campaignRoutes';
import linkRoutes from './routes/linkRoutes';
import redirectRoutes from './routes/redirectRoutes';
import postbackRoutes from './routes/postbackRoutes';
import reportRoutes from './routes/reportRoutes';
import addonDomainRoutes from './routes/addonDomainRoutes';
import uploadRoutes from './routes/uploadRoutes';
import authRoutes from './routes/authRoutes';

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: '*', // Allow all origins for easier debugging
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve static files from client public directory (for videos)
app.use('/videos', express.static(path.join(__dirname, '../../client/public/videos')));

app.use('/api/auth', authRoutes);
app.use('/api/trackers', trackerRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/postback', postbackRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/addon-domains', addonDomainRoutes);
app.use('/api/upload', uploadRoutes);

// Register redirect routes LAST as it handles catch-all /:slug
app.use('/', redirectRoutes);

app.get('/', (req, res) => {
    res.send('Backend is running!');
});

// Initialize WebSocket for live traffic
initWebSocket(server);

// server.listen(port, () => {
//     console.log(`Server is running at http://localhost:${port}`);
//     console.log(`WebSocket available at ws://localhost:${port}/ws/live-traffic`);
// });

if (process.env.NODE_ENV !== 'production') {
    server.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
        console.log(`WebSocket available at ws://localhost:${port}/ws/live-traffic`);
    });
}

export const handler = serverless(app);
export default app;
