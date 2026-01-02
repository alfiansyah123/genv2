
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export const login = async (req: Request, res: Response) => {
    try {
        const { password } = req.body;

        // Find the admin user (we assume single user for now or find by username if we kept it)
        // Since we removed username field in frontend, we might just look for *any* admin or a specific one?
        // Let's stick to the schema I just made: Admin has username & password. 
        // But frontend only sends password. 
        // We will default to username 'admin' for the lookup.

        console.log('Login attempt received with password length:', password?.length);

        const admin = await prisma.admin.findUnique({
            where: { username: 'admin' }
        });

        if (!admin) {
            console.log('Admin user not found in database');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('Admin found, checking password...');
        const isMatch = await bcrypt.compare(password, admin.password);
        console.log('Password match result:', isMatch);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate Token
        const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, {
            expiresIn: '24h'
        });

        res.json({ token, user: { username: admin.username } });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

export const changePassword = async (req: Request, res: Response) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ error: 'Both old and new passwords are required' });
        }

        const admin = await prisma.admin.findUnique({
            where: { username: 'admin' }
        });

        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        const isMatch = await bcrypt.compare(oldPassword, admin.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid old password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.admin.update({
            where: { username: 'admin' },
            data: { password: hashedPassword }
        });

        res.json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to update password' });
    }
};

export const setupInitialAdmin = async (req: Request, res: Response) => {
    try {
        const count = await prisma.admin.count();
        if (count > 0) {
            return res.status(403).json({ error: 'Admin already exists' });
        }

        const { password } = req.body;
        if (!password) return res.status(400).json({ error: 'Password required' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await prisma.admin.create({
            data: {
                username: 'admin',
                password: hashedPassword
            }
        });

        res.json({ message: 'Admin created successfully', username: admin.username });

    } catch (error) {
        res.status(500).json({ error: 'Setup failed' });
    }
};

export const verifyToken = async (req: Request, res: Response) => {
    // Simple check endpoint to validate token on frontend reload
    // Middleware would handle the actual verification before reaching here
    res.json({ valid: true });
};
