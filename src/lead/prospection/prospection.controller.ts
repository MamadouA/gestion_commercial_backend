import { Body, Controller, DefaultValuePipe, Get, Post, Query } from '@nestjs/common';
import { CreateProspectionDTO } from './dto/create-prospection.dto';
import { CurrentUser } from '../../shared/current-user.decoration';
import { ProspectionService } from './prospection.service';
import { User } from '../../generated/prisma/client';
import { ProspectionQueryDTO } from './dto/prospection-query.dto';

@Controller('prospection')
export class ProspectionController {
    constructor(private prospectionService: ProspectionService) {}
    @Post('create')
    async create(@Body() createProspectionDto: CreateProspectionDTO, @CurrentUser() currentUser: User) {
        return await this.prospectionService.create(createProspectionDto, currentUser.id, currentUser.tenantId);
    }

    @Get('all')
    async findAll(@Query(new DefaultValuePipe({ 
        prosposedService: "",
        startDate: "",
        endDate: "",
        status: "",
        currentPage: 1, 
        pageSize: 10 
    })) query: ProspectionQueryDTO, @CurrentUser('tenantId') tenantId: number) {
        return await this.prospectionService.findAll(query, tenantId);
    }
}
