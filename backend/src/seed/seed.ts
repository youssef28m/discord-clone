import { prisma } from '../prisma/client.js';
async function seedUsers() {
    try {
        // Create some test users
        const users = [
            {
                username: 'alice',
                email: 'alice@example.com',
                password: 'password123',
                avatarUrl: 'https://example.com/avatar1.png',
                status: 'online',
            },
            {
                username: 'bob',
                email: 'bob@example.com',
                password: 'password123',
                avatarUrl: 'https://example.com/avatar2.png',
                status: 'away',
            },
            {
                username: 'charlie',
                email: 'charlie@example.com',
                password: 'password123',
                status: 'offline',
                avatarUrl: 'https://example.com/avatar2.png',
            },
        ];
        for (const user of users) {
            await prisma.user.upsert({
                where: { email: user.email },
                update: {},
                create: user,
            });
        }
        console.log('Users seeded successfully');
    }
    catch (error) {
        console.error('Error seeding users:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
// Run the seed function
seedUsers();
