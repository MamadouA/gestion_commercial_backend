import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { PrismaClientService } from '../database/prisma-client.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantService {

  constructor(private prismaClientService: PrismaClientService) {}
  
  create(createTenantDto: CreateTenantDto) {
    try {
      if(createTenantDto.user.password !== createTenantDto.user.confirmPassword) {
        throw new BadRequestException("Passwords do not match.");
      }
      const tenant = this.prismaClientService.tenant.create({ data: {
        name: createTenantDto.name,
        users: {
          create: {
            fullname: createTenantDto.user.fullname,
            email: createTenantDto.user.email,
            password: bcrypt.hashSync(createTenantDto.user.password, 10),
            phone: createTenantDto.user.phone,
            roles: createTenantDto.user.roles,
          }
        }
      } });
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
