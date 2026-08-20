import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { CreateProspectionDTO } from './dto/create-prospection.dto';
import { CurrentUser } from '../../shared/current-user.decoration';
import { ProspectionService } from './prospection.service';
import { User } from '../../generated/prisma/client';
import { ProspectionQueryDTO } from './dto/prospection-query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FILE_FILTER } from '../../common/common.constants';

@Controller('prospection')
export class ProspectionController {
  constructor(private prospectionService: ProspectionService) {}

  // -
  @Post('create')
  @UseInterceptors(FileInterceptor('file', FILE_FILTER))
  async create(
    @Body() createProspectionDto: CreateProspectionDTO,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() currentUser: User,
  ) {
    return await this.prospectionService.create(
      createProspectionDto,
      currentUser.id,
      currentUser.tenantId,
      file,
    );
  }

  // -
  @Get('all')
  async findAll(
    @Query(
      new DefaultValuePipe({
        authorName: null,
        contactNameOrEnterpriseName: null,
        startDate: null,
        endDate: null,
        status: null,
        currentPage: 1,
        pageSize: 10,
      }),
    )
    query: ProspectionQueryDTO,
    @CurrentUser('tenantId') tenantId: number,
  ) {
    return await this.prospectionService.findAll(query, tenantId);
  }

  //
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('tenantId') tenantId: number,
  ) {
    return await this.prospectionService.findOne(id, tenantId);
  }
}
