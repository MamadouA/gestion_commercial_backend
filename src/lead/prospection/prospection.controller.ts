import { Body, Controller, Post } from '@nestjs/common';
import { CreateProspectionDTO } from './dto/create-prospection.dto';
import { CurrentUser } from '../../shared/current-user.decoration';
import { ProspectionService } from './prospection.service';

@Controller('prospection')
export class ProspectionController {
    constructor(private prospectionService: ProspectionService) {}
    @Post('create')
    async create(@Body() createProspectionDto: CreateProspectionDTO, @CurrentUser('tenantId') tenantId: number) {
        return await this.prospectionService.create(createProspectionDto, tenantId);
    }
}
