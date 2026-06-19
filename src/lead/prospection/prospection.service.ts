import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaClientService } from '../../database/prisma-client.service';
import { CreateProspectionDTO } from './dto/create-prospection.dto';
import { ProspectionQueryDTO } from './dto/prospection-query.dto';
import { S3ClientService } from '../../common/file-uploader/s3-client.service';

@Injectable()
export class ProspectionService {
    constructor(private prismaClientService: PrismaClientService, private s3ClientService: S3ClientService) {}

    // -
    async create(createProspectionDto: CreateProspectionDTO, authorId: number, tenantId: number, files: Array<Express.Multer.File>) {
        try {
            const filesMetadata = await this.s3ClientService.bulkSaveFiles(files);

            const prospection = await this.prismaClientService.prospection.create({
                data: {
                    clientId: createProspectionDto.clientIid,
                    endDate: createProspectionDto.endDate,
                    startDate: createProspectionDto.startDate,
                    proposedService: createProspectionDto.prosposedService,
                    authorId,
                    tenantId,
                    documents: JSON.stringify(filesMetadata)
                },
                omit: {
                    tenantId: true
                }
            });

            return { ...prospection, documents: JSON.parse(prospection.documents as string) };
        }
        catch(err) {
            console.log("Error while creating the lead: ", err);
            throw new InternalServerErrorException("Error while creating the lead.");
        }
    }

    // 
    async findAll(query: ProspectionQueryDTO, tenantId: number) {
        const filter = { tenantId };

        if (query.proposedService) {
            filter['proposedService'] = {
                contains: query.proposedService,
                mode: 'insensitive'
            }
        }

        if(query.startDate) {
            filter['startDate'] = {
                gte: new Date(query.startDate)
            }
        }

        if(query.endDate) {
            filter['endDate'] = {
                lte: new Date(query.endDate)
            }
        }

        if(query.status) {
            filter['status'] = {
                equals: query.status
            }
        }

        
        try {
            const prospections = await this.prismaClientService.prospection.findMany({
                where: filter,
                skip: (query.currentPage - 1) * query.pageSize,
                take: query.pageSize,
                orderBy: {
                    createdAt: 'desc'
                },
                select: {
                    id: true,
                    proposedService: true,
                    startDate: true,
                    endDate: true,
                    status: true,
                    createdAt: true,
                    client: {
                        select: {
                            id: true,
                            type: true,
                            enterpriseName: true,
                            contactName: true,
                        }
                    },
                    author: {
                        omit: {
                            password: true,
                            tenantId: true,
                        }
                    }
                }
            });

            const count = await this.prismaClientService.prospection.count({
                where: {
                    tenantId,
                }
            });

            return { prospections, count };
        }
        catch(err) {
            console.log("Error while fetching the prospections: ", err);
            throw new InternalServerErrorException("Error while fetching the prospections.");
        }
    }
}
