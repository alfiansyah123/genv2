
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const password = process.argv[2];
    if (!password) {
        console.log('Please provide a password: npx ts-node src/seed.ts <password>');
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const admin = await prisma.admin.upsert({
            where: { username: 'admin' },
            update: { password: hashedPassword },
            create: {
                username: 'admin',
                password: hashedPassword,
            },
        });
        console.log(`Admin user configured with password: ${password}`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
