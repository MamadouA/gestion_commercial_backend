import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CurrentUser } from '../shared/current-user.decoration';
import { CreateInvoiceDTO } from './dto/create-invoice.dto';
import { CurrentUserType } from '../auth/auth.types';
import { FileInterceptor } from '@nestjs/platform-express';
import { FILE_FILTER } from '../common/common.constants';
import { InvoiceQueryDTO } from './dto/invoice.query.dto';

@Controller('invoice')
export class InvoiceController {
    constructor(private readonly invoiceService: InvoiceService) {}

    @Post('create')
    @UseInterceptors(FileInterceptor('file', FILE_FILTER))
    async create(@Query('projectId', new ParseIntPipe({ optional: true })) projectId: number, @Body() createInvoiceDTO: CreateInvoiceDTO, @UploadedFile()file: Express.Multer.File, @CurrentUser() user: CurrentUserType) {
        return this.invoiceService.create(projectId, createInvoiceDTO, file , user);
    }

    @Get('all')
    async findAll(@Query() query: InvoiceQueryDTO, tenantId: number) {
        return this.invoiceService.findAll(query, tenantId);
    }

    @Get('project/:projectId')
    async findByProjectId(@Param('projectId', ParseIntPipe) projectId: number, @CurrentUser('tenantId') tenantId: number) {
        return this.invoiceService.findByProjectId(projectId, tenantId);
    }
}
