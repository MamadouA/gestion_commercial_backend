import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../shared/current-user.decoration';
import { User } from '../generated/prisma/client';
import { UserQueryDTO } from './dto/user-query.dto';
import { SearchDTO } from '../shared/dto/search.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  async create(@Body() createUserDto: CreateUserDTO, @CurrentUser('tenantId') tenantId: number) {
    return this.userService.create(createUserDto, tenantId);
  }

  @Get('all')
  async findAll(@Query() query: UserQueryDTO, @CurrentUser() user: User) {
    return this.userService.findAll(query, user.id, user.tenantId);
  }

  @Get('search')
  async search(@Query() search: SearchDTO, @CurrentUser() user: User) {
    return this.userService.search(search, user.id, user.tenantId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('tenantId') tenantId: number,
  ) {
    return this.userService.findOne(id, tenantId);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: string) {
    return this.userService.remove(+id);
  }
}
