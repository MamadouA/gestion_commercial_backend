import { Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CurrentUser } from '../shared/current-user.decoration';

@Controller('invoice')
export class InvoiceController {
    constructor(private readonly invoiceService: InvoiceService) {}

    @Get('all')
    async findAll(tenantId: number) {
        return this.invoiceService.findAll(tenantId);
    }

    @Get('project/:projectId')
    async findByProjectId(@Param('projectId', ParseIntPipe) projectId: number, @CurrentUser('tenantId') tenantId: number) {
        return this.invoiceService.findByProjectId(projectId, tenantId);
    }

    @Post('create')

    async create() {

    }
}
