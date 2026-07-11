import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { MissionService } from './mission.service';
import { CreateMissionDTO } from './dto/create-mission.dto';
import { CurrentUser } from '../shared/current-user.decoration';
import { MissionQueryDTO } from './dto/mission-query.dto';

@Controller('mission')
export class MissionController {
    constructor(private readonly missionService: MissionService) {}

    @Get('all')
    async findAll(@Query() query: MissionQueryDTO, @CurrentUser('tenantId') tenantId: number) {
        return await this.missionService.findAll(query, tenantId);
    }

    @Post('create')
    async create(@Body() createMissionDto: CreateMissionDTO, @CurrentUser('tenantId') tenantId: number) {
        return await this.missionService.create(createMissionDto, tenantId);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser('tenantId') tenantId: number) {
        return await this.missionService.findOne(id, tenantId);
    }
}
