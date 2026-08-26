import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CurrentUser } from '../shared/current-user.decoration';
import { FileInterceptor } from '@nestjs/platform-express';
import { FILE_FILTER } from '../common/common.constants';
import { User } from '../generated/prisma/client';
import { CurrentUserType } from '../auth/auth.types';
import { UpdateTimesheetDTO } from './dto/update-timesheet.dto';
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get('all')
  async findAll(@CurrentUser('tenantId') tenantId: number) {
    return await this.projectService.findAll(tenantId);
  }

  @Get(':projectId/timesheet/all')
  async findCurrentUserTimesheets(@Param('projectId', ParseIntPipe) projectId: number, @CurrentUser() user: CurrentUserType) {
    return await this.projectService.findCurrentUserTimesheets(projectId, user);
  }

  @Post(':projectId/timesheet/create')
  async createTimesheet(@Param('projectId', ParseIntPipe) projectId: number, @CurrentUser() user: CurrentUserType) {
    return await this.projectService.createTimesheet(projectId, user);
  }

  @Patch(':projectId/timesheet/:timesheetId/update')
  async updateTimesheet(
    @Param('projectId', ParseIntPipe) projectId: number, 
    @Param('timesheetId', ParseIntPipe) timesheetId: number, 
    @Body() updateTimesheetDTO: UpdateTimesheetDTO,
    @CurrentUser() user: CurrentUserType) {
    return await this.projectService.updateTimesheet(projectId, timesheetId, updateTimesheetDTO, user);
  }

  // -
  @Post('create/:offerId')
  @UseInterceptors(FileInterceptor('file', FILE_FILTER))
  async create(
    @Param('offerId') offerId: number,
    @UploadedFile() contractDocument: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return await this.projectService.create(
      offerId,
      user,
      contractDocument,
    );
  }

  // -
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('tenantId') tenantId: number,
  ) {
    return await this.projectService.findOne(id, tenantId);
  }
}
