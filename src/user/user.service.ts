import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaClientService } from '../database/prisma-client.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {

  constructor(private prismaClientService: PrismaClientService) {}

  // -
  async create(createUserDto: CreateUserDTO, tenantId: number) {
    try {
      return await this.prismaClientService.user.create({
        data: {
          tenantId,
          fullname: createUserDto.fullname,
          email: createUserDto.email,
          phone: createUserDto.phone,
          roles: createUserDto.roles,
          password: bcrypt.hashSync("testing1234", 10),
        },
        omit: {
          password: true,
          tenantId: true,
          isActive: true,
          createdAt: true
        }
      });
    }
    catch(err) {
      console.log("Error while creating the user: ", err);
      throw new InternalServerErrorException("Error while creating the user.");
    }
  }

  findAll(userId: number, tenantId: number) {
    try {
      return this.prismaClientService.user.findMany({
        where: {
          tenantId,
          id: { 
            not: userId
          }
        },
        orderBy: {
          id: 'desc'
        },
        select: {
          id: true,
          fullname: true,
          email: true,
          roles: true,
        }
      });
    }
    catch(err) {
      console.log("Error while fetching the users: ", err);
      throw new InternalServerErrorException("Error while fetching the users.");
    }
  }

  async findOne(id: number, tenantId: number) {
    try{
      const user = await this.prismaClientService.user.findUnique({
        where: {
          id,
          tenantId
        },
        omit: {
          password: true
        }
      });

      return user;
    }
    catch(err) {
      console.log("Error while fetching the user: ", err);
      throw new InternalServerErrorException("Error while fetching the user.");
    }
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
