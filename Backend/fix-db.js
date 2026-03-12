import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Adding columns to StudentProfile...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "StudentProfile" 
      ADD COLUMN IF NOT EXISTS "portfolioUrl" TEXT,
      ADD COLUMN IF NOT EXISTS "bio" TEXT;
    `);

    console.log('Adding columns to SchoolProfile...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "SchoolProfile" 
      ADD COLUMN IF NOT EXISTS "address" TEXT,
      ADD COLUMN IF NOT EXISTS "contactEmail" TEXT,
      ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT;
    `);

    console.log('Columns added successfully!');
  } catch (error) {
    console.error('Error adding columns:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
