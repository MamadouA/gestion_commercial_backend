import { Body, Controller, Get, ParseIntPipe, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ReportService } from './report.service';
import { CurrentUser } from '../shared/current-user.decoration';
import { CurrentUserType } from '../auth/auth.types';
import { FileInterceptor } from '@nestjs/platform-express';
import { FILE_FILTER } from '../common/common.constants';
import { CreateReportDTO } from './dto/create-report.dto';

@Controller('report')
export class ReportController {
    constructor(private readonly reportService: ReportService) {}

    @Post('create')
    @UseInterceptors(FileInterceptor('file', FILE_FILTER))
    async create(@Query('projectId', new ParseIntPipe({ optional: true })) projectId: number, @Body() createReportDTO: CreateReportDTO, @UploadedFile() file: Express.Multer.File, @CurrentUser() user: CurrentUserType) {
        return await this.reportService.create(projectId, createReportDTO, file, user);
    }

    @Get('project/:projectId')
    async findByProjectId(projectId: number, @CurrentUser('tenantId') tenantId: number) {
        return await this.reportService.findByProjectId(projectId, tenantId);
    }
}
