import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { PrismaClientService } from '../database/prisma-client.service';

@Injectable()
export class TenantService {

  constructor(private prismaClientService: PrismaClientService) {}

  create(createTenantDto: CreateTenantDto) {
    try {
      const tenant = this.prismaClientService.tenant.create({ data: createTenantDto });
      return tenant;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Error while creating a new tenant: " + error);;
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
