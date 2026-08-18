import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaClientService } from '../database/prisma-client.service';
import * as bcrypt from 'bcrypt';
import { UserQueryDTO } from './dto/user-query.dto';
import { UserWhereInput } from '../generated/prisma/models';
import { SearchDTO } from '../shared/dto/search.dto';

@Injectable()
export class UserService {

  constructor(private prismaClientService: PrismaClientService) {}

  // -
  async create(createUserDto: CreateUserDTO, tenantId: number) {
    try {
      return await this.prismaClientService.user.create({
        data: {
          tenant: {
            connect: {
              id: tenantId
            }
          },
          fullname: createUserDto.fullname,
          email: createUserDto.email,
          phone: createUserDto.phone,
          role: {
            connect: {
              id: createUserDto.roleId
            }
          },
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

  // -
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
          role: {
            select: {
              name: true,
              description: true
            }
          },
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

  // -
  async findOne(id: number, tenantId: number) {
    try{
      const user = await this.prismaClientService.user.findUnique({
        where: {
          id,
          tenantId
        },
        select: {
          id: true,
          fullname: true,
          email: true,
          phone: true,
          role: {
            select: {
              name: true,
              description: true
            }
          },
        }
      });

      return user;
    }
    catch(err) {
      console.log("Error while fetching the user: ", err);
      throw new InternalServerErrorException("Error while fetching the user.");
    }
  }

  // -
  async update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async search(search: SearchDTO, userId: number, tenantId: number) {
    try {
      const filter: UserWhereInput = { tenantId, id: { not: userId } };

      if(search.keyword && search.keyword.length) {
        filter.OR = [
          {
            fullname: {
              contains: search.keyword,
              mode: 'insensitive'
            }
          },
          {
            email: {
              contains: search.keyword,
              mode: 'insensitive'
            },
          }
        ]

        if(search.keyword && search.keyword.length) {
          filter.OR.push({
            role: {
              name: {
                contains: search.keyword,
                mode: 'insensitive'
              }
            }
          })
        }
      }

    
      return await this.prismaClientService.user.findMany({
        where: filter,
        orderBy: {
          id: 'desc'
        },
        select: {
          id: true,
          fullname: true,
          email: true,
          role: true,
        },
        skip: (search.currentPage - 1) * search.pageSize,
        take: search.pageSize
      })
    }
    catch(err) {
      console.log("Error while searching the users: ", err);
      throw new InternalServerErrorException("Error while searching the users.");
    }
  }

  // -
  async remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
