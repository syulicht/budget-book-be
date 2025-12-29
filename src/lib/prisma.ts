import { PrismaClient } from '@prisma/client';
import { getDatabaseURLFromSSM } from './ssm.js';

declare global {
    var prisma : PrismaClient | undefined;
}

export async function getPrismaClient() {
    if(!globalThis.prisma){
        const url = getDatabaseURLFromSSM();
        if(!url) throw new Error('DatabaseURL is not found');

        globalThis.prisma = new PrismaClient({
            datasources: {db: {url}}
        });
    }

    return globalThis.prisma;
}
