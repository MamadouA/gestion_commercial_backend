import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { PrismaClientService } from '../database/prisma-client.service';
import * as bcrypt from 'bcrypt';
import { CreateTenantDTO } from './dto/create-tenant.dto';
import { APP_PERMISSIONS } from '../role-management/role-management.contants';
import { Feature } from '../generated/prisma/enums';

@Injectable()
export class TenantService {

  constructor(private prismaClientService: PrismaClientService) {}
  
  async create(createTenantDto: CreateTenantDTO) {
    try {
      const subscription = await this.prismaClientService.subscription.findUnique({
        where: {
          id: createTenantDto.subscriptionId
        }
      });

      if (!subscription) {
        throw new BadRequestException('Subscription not found.');
      }

      const tenant = await this.prismaClientService.$transaction(async (tx) => {
        const createdTenant = await tx.tenant.create({
          data: {
            name: createTenantDto.name,
            subscription: {
              connect: {
                id: subscription.id
              }
            }
          },
        });

        return tx.user.create({
          data: {
            fullname: createTenantDto.admin.fullname,
            email: createTenantDto.admin.email,
            password: bcrypt.hashSync(createTenantDto.admin.password, 10),
            phone: createTenantDto.admin.phone,
            tenant: {
              connect: {
                id: createdTenant.id,
              },
            },
            role: {
              create: {
                name: 'ADMIN',
                description: 'Administrateur',
                tenant: {
                  connect: {
                    id: createdTenant.id,
                  },
                },
                permissions: {
                  connect: createTenantDto.admin.permissionIds.map((permissionId) => ({ id: permissionId })),
                },
              },
            },
          },
        });
      });

      return tenant;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error while creating a new tenant: ' + error);
    }
  }

  findAll() {
    return `This action returns all tenant`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tenant`;
  }

  update(id: number, updateTenantDto: UpdateTenantDto) {
    return `This action updates a #${id} tenant`;
  }

  remove(id: number) {
    return `This action removes a #${id} tenant`;
  }
}
