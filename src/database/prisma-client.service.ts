import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { Feature, PrismaClient } from '../generated/prisma/client';
import { APP_PERMISSIONS } from '../role-management/role-management.contants';
import * as bcrypt from 'bcrypt';

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
      const tenant = await this.tenant.create({
        data: {
          name: process.env.SUPERADMIN_TENANT_NAME ?? '',
          subscription: {
            create: {
              maxUserCount: 10,
              price: 60000,
              storage: 20,
              features: {
                set: ['TENANT'],
              },
            },
          },
          roles: {
            create: {
              name: 'SUPERADMIN',
              description: 'Super Admin',
              permissions: {
                create: {
                  name: 'tenant.manage',
                  description: "Voir et gérer l'ensemble des tenants",
                  feature: 'TENANT',
                },
              },
            },
          },
        },
        include: {
          roles: {
            include: {
              permissions: true,
            },
            take: 1,
          },
        },
      });

      await this.user.create({
        data: {
          email: process.env.SUPERADMIN_EMAIL ?? '',
          password: bcrypt.hashSync(process.env.SUPERADMIN_PASSWORD ?? '', 10),
          fullname: process.env.SUPERADMIN_FULLNAME ?? '',
          phone: process.env.SUPERADMIN_PHONE ?? '',
          tenant: {
            connect: {
              id: tenant.id,
            },
          },
          role: {
            connect: {
              id: tenant.roles[0].id,
            },
          },
        },
      });

      const permissions: {name: string, description: string, feature: Feature}[] = []

      Object.values(APP_PERMISSIONS).forEach((featurePermissions) => {
        featurePermissions.forEach((permission) => {
          permissions.push({
            name: permission.name,
            description: permission.description,
            feature: permission.feature as Feature,
          });
        });
      })

      await this.permission.createMany({
        data: permissions,
      });
    }
  }
}
