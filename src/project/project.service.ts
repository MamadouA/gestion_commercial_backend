import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaClientService } from '../database/prisma-client.service';
import { S3ClientService } from '../common/file-manager/s3-client.service';
import { FileMetadata } from '../shared/shared.types';

@Injectable()
export class ProjectService {
    private logger = new Logger(ProjectService.name);

    constructor(private readonly prismaClientService: PrismaClientService, private readonly s3ClientService: S3ClientService) {}

    // -
    async findAll(tenantId: number) {
        try {
            const projects = await this.prismaClientService.project.findMany({ where: { tenantId }, 
                omit: {
                    tenantId: true,
                    description: true
                },
                include: {
                    client: {
                        select: {
                            id: true,
                            type: true,
                            enterpriseName: true,
                            contactName: true,
                        }
                    }
                }});

            const count = await this.prismaClientService.project.count({ where: { tenantId } });
            return { projects, count };
        }
        catch(err) {
            this.logger.error("Error while fetching the projects: ", err);
            throw new InternalServerErrorException("Error while fetching the projects.");
        }
    }

    // - a project is created from an existing offer
    async create(offerId: number, tenantId: number, contractDocument: Express.Multer.File) {
        let fileMetadata: FileMetadata | null = null;

        try {
            const offer = await this.prismaClientService.offer.findFirstOrThrow({ where: { id: offerId, tenantId } });

            const projectData = {
                title: offer.title,
                description: offer.description,
                offerId,
                clientId: offer.clientId,
                tenantId,
            }

            if(contractDocument) {  
                fileMetadata = await this.s3ClientService.save(contractDocument);
                projectData['documents'] = { create: fileMetadata };
            }

            return await this.prismaClientService.project.create({
                data: projectData
            });
        }
        catch(err) {
            if(fileMetadata) {
                await this.s3ClientService.delete(fileMetadata.storedName);
            }
            this.logger.error("Error while creating the project: ", err);
            throw new InternalServerErrorException("Error while creating the project.");
        }
    }

    // -
    async findOne(id: number, tenantId: number) {
        try {
            return await this.prismaClientService.project.findFirstOrThrow({ where: { id, tenantId }, 
                omit: {
                    tenantId: true,
                },
                include: {
                    client: {
                        omit: {
                            tenantId: true,
                        }
                    },
                    journalEvents: {
                        include: {
                            author: {
                                select: {
                                    id: true,
                                    fullname: true,
                                    email: true,
                                }
                            }
                        },
                        orderBy: {
                            id: 'desc'
                        }
                    },
                    invoices: {
                        include: {
                            author: {
                                select: {
                                    id: true,
                                    fullname: true,
                                    email: true,
                                }
                            },
                            document: {
                                select: {
                                    id: true,
                                    originalName: true,
                                    createdAt: true,
                                    size: true,
                                    mimetype: true
                                }
                            }
                        },
                        orderBy: {
                            id: 'desc'
                        }
                    },
                    documents: {
                        select: {
                            id: true,
                            originalName: true,
                            createdAt: true,
                            size: true,
                            mimetype: true
                        },
                        orderBy: {
                            id: 'desc'
                        }
                    }
                }});
        }
        catch(err) {
            this.logger.error("Error while fetching the project: ", err);
            throw new InternalServerErrorException("Error while fetching the project.");
        }
    }
}
