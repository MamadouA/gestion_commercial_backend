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
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateCommentDTO } from '../../shared/dto/create.comment.dto';
import { FILE_FILTER } from '../../common/common.constants';

@Controller('prospection')
export class ProspectionController {
  constructor(private prospectionService: ProspectionService) {}

  // -
  @Post('create')
  @UseInterceptors(FilesInterceptor('files', 10, FILE_FILTER))
  async create(
    @Body() createProspectionDto: CreateProspectionDTO,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @CurrentUser() currentUser: User,
  ) {
    return await this.prospectionService.create(
      createProspectionDto,
      currentUser.id,
      currentUser.tenantId,
      files,
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

  // -
  @Post(':id/comment/create')
  async createComment(
    @Body() createCommentDto: CreateCommentDTO,
    @Param('id', ParseIntPipe) prospectionId: number,
    @CurrentUser('id') authorId: number,
  ) {
    return await this.prospectionService.createComment(
      createCommentDto,
      prospectionId,
      authorId,
    );
  }

  //
  @Get(':id/comment')
  async findCommentsByProspectionId(@Param('id', ParseIntPipe) id: number) {
    return await this.prospectionService.findCommentsByProspectionId(id);
  }

  // -
  @Post(':id/document/create')
  @UseInterceptors(FilesInterceptor('file', 1, FILE_FILTER))
  async createDocument(@Param('id', ParseIntPipe) id: number, @UploadedFile() file: Express.Multer.File) {
    return await this.prospectionService.createDocument(id, file);
  }

  @Delete(':id/document/:documentId')
  async deleteDocument(@Param('id', ParseIntPipe) id: number, @Param('documentId', ParseIntPipe) documentId: number) {
    return await this.prospectionService.deleteDocument(id, documentId);
  }
}
