/* eslint-disable @typescript-eslint/no-misused-promises */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.admin.create({
    data: {
      username: 'useradmin',
      password: 'admin123', // TODO: Implementar bcrypt em produção
    },
  });

  await prisma.users.create({
    data: {
      name: 'Test User',
      email: 'test@example.com',
      telephone: '123456789',
      role: 'USER',
      age: 30,
      salary: 5000,
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
