import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClientService } from '../database/prisma-client.service';

@Injectable()
export class InvoiceService {
    private logger = new Logger(InvoiceService.name);
    
    constructor(private readonly prismaClientService: PrismaClientService) {}

    // -
    async findAll(tenantId: number) {
        
    }
    
    // -
    async findByProjectId(projectId: number, tenantId: number) {
        try {
            const project = await this.prismaClientService.project.findUnique({ where: { id: projectId, tenantId }});

            if(!project) {
                throw new NotFoundException("Project not found.");
            }
            const invoices = await this.prismaClientService.invoice.findMany({ 
                where: { projectId },
                include: {
                    author: {
                        select: {
                            id: true,
                            fullname: true,
                        }
                    },
                    document: {
                        select: {
                            id: true,
                            description: true,
                            createdAt: true,
                            size: true,
                            originalName: true,
                        }
                    }
                }
            });

            const count = await this.prismaClientService.invoice.count({ where: { projectId }});
            return { invoices, count };
        }
        catch(err) {
            this.logger.error("Error while fetching the invoices: ", err);
            throw new InternalServerErrorException("Error while fetching the invoices.");
        }
    }
}
