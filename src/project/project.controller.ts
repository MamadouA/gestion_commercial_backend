import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CurrentUser } from '../shared/current-user.decoration';
import { FileInterceptor } from '@nestjs/platform-express';
import { FILE_FILTER } from '../common/common.constants';
import { UpdateProjectDTO } from './dto/update-project.dto';
import { User } from '../generated/prisma/client';
import { CreateInvoiceDTO } from '../invoice/dto/create-invoice.dto';
import { InvoiceQueryDTO } from '../invoice/dto/invoice.query.dto';
import { JournalEventQueryDTO } from './dto/journal-event-query.dto';

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
  async create(
    @Param('offerId') offerId: number,
    @UploadedFile() contractDocument: Express.Multer.File,
    @CurrentUser('tenantId') tenantId: number,
  ) {
    return await this.projectService.create(
      offerId,
      tenantId,
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

  @Get(':id/journal-events/all')
  async getJournalEvents(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('tenantId') tenantId: number,
    @Query() query: JournalEventQueryDTO,
  ) {
    return await this.projectService.getJournalEvents(id, tenantId, query);
  }

  @Get(':id/invoices/all')
  async getInvoices(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('tenantId') tenantId: number,
    @Query() query: InvoiceQueryDTO
  ) {
    return await this.projectService.getInvoices(id, tenantId, query);
  }

  @Post(':id/invoice/create')
  @UseInterceptors(FileInterceptor('file', FILE_FILTER))
  async createInvoice(
    @Param('id', ParseIntPipe) id: number,
    @Body() createInvoiceDTO: CreateInvoiceDTO,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return await this.projectService.createInvoice(
      id,
      createInvoiceDTO,
      file,
      user,
    );
  }

  @Post(':id/document/create')
  @UseInterceptors(FileInterceptor('file', FILE_FILTER))
  async createDocument(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('tenantId') tenantId: number,
  ) {
    return await this.projectService.createDocument(id, file, tenantId);
  }

  @Get(':id/documents/all')
  async getDocuments(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('tenantId') tenantId: number,
  ) {
    return await this.projectService.getDocuments(id, tenantId);
  }

  @Get(':id/document/:documentId/url')
  async getDocumentDownLoadUrl(
    @Param('id', ParseIntPipe) id: number,
    @Param('documentId', ParseIntPipe) documentId: number,
    @CurrentUser('tenantId') tenantId: number,
  ) {
    return await this.projectService.getDocumentDownLoadUrl(
      id,
      documentId,
      tenantId,
    );
  }

  @Get(':id/journal-event/:journalEventId/url')
  async getJournalEventDocumentUrl(
    @Param('id', ParseIntPipe) id: number,
    @Param('journalEventId', ParseIntPipe) journalEventId: number,
    @CurrentUser('tenantId') tenantId: number,
  ) {
    return await this.projectService.getJournalEventDocumentUrl(
      id,
      journalEventId,
      tenantId,
    );
  }
}
