import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClientService } from '../database/prisma-client.service';
import { CreateInvoiceDTO } from './dto/create-invoice.dto';
import { CurrentUserType } from '../auth/auth.types';
import { FileMetadata } from '../shared/shared.types';
import { S3ClientService } from '../common/file-manager/s3-client.service';
import { InvoiceQueryDTO } from './dto/invoice.query.dto';
import { InvoiceWhereInput } from '../generated/prisma/models';

@Injectable()
export class InvoiceService {
    private logger = new Logger(InvoiceService.name);
    
    constructor(private readonly prismaClientService: PrismaClientService, private readonly s3ClientService: S3ClientService) {}

    async create(projectId: number | null, createInvoiceDTO: CreateInvoiceDTO, file: Express.Multer.File, user: CurrentUserType) {
        let fileMetadata: FileMetadata | null = null;
        const data = {
            ...createInvoiceDTO,
            author: {
                connect: {
                    id: user.id
                }
            },
            tenant: {
                connect: {
                    id: user.tenantId
                }
            }
        }
        try{
            if(!file) {
                throw new NotFoundException("The invoice document is required.");
            }
            
            // - if the invoice belongs to a project
            if(projectId) {
                const project = await this.prismaClientService.project.findFirstOrThrow({ where: { id: projectId, tenantId: user.tenantId }});

                data['project'] = {
                    connect: {
                        id: project.id
                    }
                };
            }
            
            fileMetadata = await this.s3ClientService.save(file);
            return await this.prismaClientService.invoice.create({ 
                data: {...data, document: { create: fileMetadata}},
                omit: {
                    authorId: true,
                    tenantId: true,
                    documentId: true,
                },
                include: {
                    document: {
                        select: {
                            id: true,
                            originalName: true,
                            size: true,
                        }
                    },
                    author: {
                        select: {
                            id: true,
                            fullname: true,
                        }
                    }
                }
            });
        }
        catch(err) {
            if(fileMetadata) {
                await this.s3ClientService.delete(fileMetadata.storedName);
            }
            this.logger.error("Error while creating the invoice: ", err);
            throw new InternalServerErrorException("Error while creating the invoice.");
        }
    }

    // -
    async findAll(invoiceQueryDTO: InvoiceQueryDTO, tenantId: number) {
        const filter: InvoiceWhereInput = { tenantId };
        try {
            if(invoiceQueryDTO.description) {
                filter.description = { contains: invoiceQueryDTO.description, mode: 'insensitive' };
            }

            if(invoiceQueryDTO.status) {
                filter.status = invoiceQueryDTO.status;
            }

            if(invoiceQueryDTO.createdAt) {
                filter.createdAt = { lte: new Date(invoiceQueryDTO.createdAt) };
            }

            const invoices = await this.prismaClientService.invoice.findMany({ 
                where: filter,
                omit: {
                    authorId: true,
                    tenantId: true,
                    documentId: true
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            fullname: true,
                        }
                    },
                    project: {
                        include: {
                            client: {
                                select: {
                                    id: true,
                                    type: true,
                                    enterpriseName: true,
                                    contactName: true,
                                }
                            }
                        }
                    }
                }
            });

            const count = await this.prismaClientService.invoice.count({ where: { tenantId } });
            return { invoices, count };
        }
        catch(err) {
            this.logger.error("Error while fetching the invoices: ", err);
            throw new InternalServerErrorException("Error while fetching the invoices.");
        }
    }
    
    // -
    async findByProjectId(projectId: number, tenantId: number) {
        try {
            const project = await this.prismaClientService.project.findFirstOrThrow({ where: { id: projectId, tenantId }});

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
