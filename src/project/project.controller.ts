import { Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CurrentUser } from '../shared/current-user.decoration';
import { FileInterceptor } from '@nestjs/platform-express';
import { FILE_FILTER } from '../common/common.constants';

@Controller('project')
export class ProjectController {
    constructor(private readonly projectService: ProjectService) {}

    @Get('all')
    async findAll(@CurrentUser('tenantId') tenantId: number) {
        return await this.projectService.findAll(tenantId);
    }

    // -
    @Post('create/:offerId')
    @UseInterceptors(FileInterceptor('file', FILE_FILTER))
    async create(@Param('offerId') offerId: number, @UploadedFile() contractDocument: Express.Multer.File, @CurrentUser('tenantId') tenantId: number) {
        return await this.projectService.create(offerId, tenantId, contractDocument);
    }

}
