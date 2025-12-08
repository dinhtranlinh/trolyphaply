// Workaround for Prisma 7 issues - use dynamic import
import type { PrismaClient as PrismaClientType } from '@prisma/client';

let prisma: PrismaClientType;

async function getPrismaClient() {
  if (!prisma) {
    const { PrismaClient } = await import('@prisma/client');
    prisma = new PrismaClient();
  }
  return prisma;
}

// For now, just export a simple instance
// This may cause multiple instances in dev but works around the __internal error
export const prisma = (() => {
  try {
    // Lazy import to avoid initialization errors
    const { PrismaClient } = require('@prisma/client');
    return new PrismaClient();
  } catch (e) {
    console.error('Failed to initialize Prisma Client:', e);
    throw e;
  }
})();
