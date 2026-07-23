import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClientService } from '../database/prisma-client.service';

@Injectable()
export class InvoiceService {
    private logger = new Logger(InvoiceService.name);
    
    constructor(private readonly prismaClientService: PrismaClientService) {}

    // -
    async getAllByProjectId(projectId: number, tenantId) {
        try {
            const project = await this.prismaClientService.project.findUnique({ where: { id: projectId, tenantId }});

            if(!project) {
                throw new NotFoundException("Project not found.");
            }

            return await this.prismaClientService.invoice.findMany({ where: { projectId }});
        }
        catch(err) {
            this.logger.error("Error while fetching the invoices: ", err);
            throw new InternalServerErrorException("Error while fetching the invoices.");
        }
    }
}
