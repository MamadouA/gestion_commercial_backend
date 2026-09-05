import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CreateClientDTO } from './dto/create-client.dto';
import { ClientService } from './client.service';
import { CurrentUser } from '../shared/current-user.decoration';
import { PaginationDTO } from '../shared/dto/pagination';
import { ClientQueryDTO } from './dto/client-query.dto';

@Controller('client')
export class ClientController {
  // -
  constructor(private clientService: ClientService) {}

  // -
  @Post('create')
  async create(
    @Body() createClientDto: CreateClientDTO,
    @CurrentUser('tenantId') tenantId: number,
  ) {
  
    return await this.clientService.create(createClientDto, tenantId);
  }

  // -
  @Get('all')
  async findAll(
    @Query(new DefaultValuePipe({ currentPage: 1, pageSize: 10 })) pagination: PaginationDTO,
    @Query() query: ClientQueryDTO,
    @CurrentUser('tenantId') tenantId: number,
  ) {
    return await this.clientService.findAll(query, tenantId);
  }

  // -
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('tenantId') tenantId: number,
  ) {
    return await this.clientService.findOne(id, tenantId);
  }

  // -
  @Get('delete/:id')
  async deleteOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('tenantId') tenantId: number,
  ) {
    return await this.clientService.deleteOne(id, tenantId);
  }
}
