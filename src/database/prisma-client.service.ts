import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaClientService
  extends PrismaClient
  implements OnApplicationBootstrap
{
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    super({ adapter });
  }

  // - seed database
  async onApplicationBootstrap() {
    const tenant = await this.tenant.findFirst();

    if (!tenant) {
      this.tenant.create({
        data: {
          name: process.env.SUPERAMDIN_TENANT_NAME ?? '',
          users: {
            create: {
              fullname: process.env.SUPERAMDIN_FULLNAME ?? '',
              email: process.env.SUPERAMDIN_EMAIL ?? '',
              password: process.env.SUPERAMDIN_PASSWORD ?? '',
              phone: process.env.SUPERAMDIN_PHONE ?? '',
              roles: ['SUPERADMIN'],
            },
          },
        },
      });
    }
  }
}
