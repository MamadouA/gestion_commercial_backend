import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaClientService extends PrismaClient implements OnApplicationBootstrap{
    constructor(){
        const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
        super({ adapter });
    }

    // - seed database
    onApplicationBootstrap() {
    
    }
}
