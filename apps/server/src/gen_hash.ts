
import bcrypt from 'bcryptjs';

async function generate() {
    const hash = await bcrypt.hash('admin', 10);
    console.log('HASH:', hash);
}

generate();
