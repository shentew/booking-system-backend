import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Evitar múltiples instancias en desarrollo con hot-reload
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 1. Crear el adaptador usando la URL de la base de datos
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

// 2. Pasar el adaptador al constructor de PrismaClient
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}