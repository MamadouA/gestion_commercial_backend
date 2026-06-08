import { Body, Controller, Get, Post } from '@nestjs/common';
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
  async findAll(@CurrentUser('tenantId') tenantId: number) {
    return await this.clientService.findAll(tenantId);
  }
}
