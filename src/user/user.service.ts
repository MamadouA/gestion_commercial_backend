import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaClientService } from '../database/prisma-client.service';
import * as bcrypt from 'bcrypt';
import { UserQueryDTO } from './dto/user-query.dto';
import { UserWhereInput } from '../generated/prisma/models';

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

  async findAll(query: UserQueryDTO, userId: number, tenantId: number) {
    const filter: UserWhereInput = {
      tenantId,
      id: {
        not: userId
      }
    }

    if(query.fullname && query.fullname.length) {
      filter.fullname = {
        contains: query.fullname,
        mode: 'insensitive'
      }
    }

    if(query.email && query.email.length) {
      filter.email = {
        contains: query.email,
        mode: 'insensitive'
      }
    }

    try {
      const users = await this.prismaClientService.user.findMany({
        where: filter,
        orderBy: {
          id: 'desc'
        },
        select: {
          id: true,
          fullname: true,
          email: true,
          roles: true,
        },
        skip: (query.currentPage - 1) * query.pageSize,
        take: query.pageSize
      });

      const count = await this.prismaClientService.user.count({
        where: {
          tenantId
        }
      });

      return { users, count };
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
