import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClientService } from '../database/prisma-client.service';
import { CurrentUserType } from '../auth/auth.types';
import { CreateReportDTO } from './dto/create-report.dto';
import { FileMetadata } from '../shared/shared.types';
import { S3ClientService } from '../common/file-manager/s3-client.service';
import { ReportUpdateInput } from '../generated/prisma/models';

@Injectable()
export class ReportService {
    private logger = new Logger(ReportService.name)
    constructor(private readonly prismaClientService: PrismaClientService, private readonly s3ClientService: S3ClientService) {}

    async create(projectId: number | null, createReportDTO: CreateReportDTO, file: Express.Multer.File, user: CurrentUserType) {
        let fileMetadata: FileMetadata | null = null;
        const data = {
            description: createReportDTO.description,
            tenant: {
                connect: {
                    id: user.tenantId
                }
            },
            author: {
                connect: {
                    id: user.id
                }
            }
        }

        try {
            if(projectId) {
                const project = await this.prismaClientService.project.findUnique({
                    where: {
                        id: projectId,
                        tenantId: user.tenantId
                    }
                });

                if(!project) {
                    throw new NotFoundException("Project not found.");
                }

                data['projectId'] = projectId;
            }

            if(!file) {
                throw new BadRequestException("Report document is required.");
            }

            fileMetadata = await this.s3ClientService.save(file);

            return await this.prismaClientService.report.create({
                data: {
                    ...data,
                    attachment: {
                        create: fileMetadata
                    }
                }
            })
        }
        catch(err) {
            this.logger.error("Error while creating the report: ", err);
            throw new InternalServerErrorException("Error while creating the report.");
        }
    }

    // -
    async findByProjectId(projectId: number, tenantId: number) {
        try {
            return await this.prismaClientService.report.findMany({
                where: {
                    projectId,
                    tenantId
                },
                omit: {
                    tenantId: true,
                    projectId: true,
                    authorId: true,
                    attachmentId: true 
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            fullname: true
                        }
                    },
                    attachment: {
                        select: {
                            id: true,
                            originalName: true,
                            mimetype: true,
                            size: true
                        }
                    }
                }
            });
        }
        catch(err) {
            this.logger.error("Error while fetching the report: ", err);
            throw new InternalServerErrorException("Error while fetching the report.");
        }
    }
}
