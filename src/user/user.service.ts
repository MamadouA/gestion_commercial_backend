import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaClientService } from '../database/prisma-client.service';

@Injectable()
export class UserService {

  constructor(private prismaClientService: PrismaClientService) {}

  // -
  async create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
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
