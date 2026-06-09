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
import { CurrentUser } from '../common/current-user.decoration';

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
        @Query('currentPage', new DefaultValuePipe(1), ParseIntPipe) currentPage: number,
        @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
        @CurrentUser('tenantId') tenantId: number,
    ) {
        return await this.clientService.findAll(currentPage, pageSize, tenantId);
    }

    // -
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser('tenantId') tenantId: number) {
    return await this.clientService.findOne(id, tenantId);
    }

    // -
    @Get('delete/:id')
    async deleteOne(@Param('id', ParseIntPipe) id: number, @CurrentUser('tenantId') tenantId: number) {
    return await this.clientService.deleteOne(id, tenantId);
    }
}


