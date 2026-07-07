import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaClientService } from '../../database/prisma-client.service';
import { CreateProspectionDTO } from './dto/create-prospection.dto';
import { ProspectionQueryDTO } from './dto/prospection-query.dto';
import { S3ClientService } from '../../common/file-manager/s3-client.service';
import { CreateCommentDTO } from '../../shared/dto/create.comment.dto';
import { ProspectionWhereInput } from '../../generated/prisma/models';
import { FileMetadata } from '../../shared/shared.types';

@Injectable()
export class ProspectionService {
  constructor(
    private prismaClientService: PrismaClientService,
    private s3ClientService: S3ClientService,
  ) {}

  // -
  async create(
    createProspectionDto: CreateProspectionDTO,
    authorId: number,
    tenantId: number,
    files: Array<Express.Multer.File>,
  ) {
    try {
      const filesMetadata = await this.s3ClientService.bulkSave(files);

      const prospection = await this.prismaClientService.prospection.create({
        data: {
          clientId: createProspectionDto.clientId,
          endDate: createProspectionDto.endDate,
          startDate: createProspectionDto.startDate,
          proposedService: createProspectionDto.prosposedService,
          authorId,
          tenantId,
          documents: {
            createMany: {
              data: filesMetadata,
            },
          },
        },
        omit: {
          tenantId: true,
        },
      });

      return { prospection };
    } catch (err) {
      console.log('Error while creating the lead: ', err);
      throw new InternalServerErrorException('Error while creating the lead.');
    }
  }

  //
  async findAll(query: ProspectionQueryDTO, tenantId: number) {
    const filter: ProspectionWhereInput = { tenantId };

    if (query.authorName) {
      filter.author = {
        fullname: {
          contains: query.authorName,
          mode: 'insensitive',
        },
      };
    }

    if (query.contactNameOrEnterpriseName) {
      filter.OR = [
        {
          client: {
            enterpriseName: {
              contains: query.contactNameOrEnterpriseName,
              mode: 'insensitive',
            },
          },
        },
        {
          client: {
            contactName: {
              contains: query.contactNameOrEnterpriseName,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    if (query.startDate) {
      filter.startDate = {
        gte: new Date(query.startDate),
      };
    }

    if (query.endDate) {
      filter.endDate = {
        lte: new Date(query.endDate),
      };
    }

    if (query.status) {
      filter.status = {
        equals: query.status,
      };
    }

    try {
      const prospections = await this.prismaClientService.prospection.findMany({
        where: filter,
        skip: (query.currentPage - 1) * query.pageSize,
        take: query.pageSize,
        orderBy: {
          createdAt: 'desc',
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
              type: true,
              enterpriseName: true,
              contactName: true,
            },
          },
          author: {
            select: {
              fullname: true,
            },
          },
        },
      });

      const count = await this.prismaClientService.prospection.count({
        where: {
          tenantId,
        },
      });

      return { prospections, count };
    } catch (err) {
      console.log('Error while fetching the prospections: ', err);
      throw new InternalServerErrorException(
        'Error while fetching the prospections.',
      );
    }
  }

  //
  async findOne(id: number, tenantId: number) {
    try {
      return await this.prismaClientService.prospection.findUnique({
        where: {
          id,
          tenantId,
        },
        omit: {
          tenantId: true,
          clientId: true,
          authorId: true,
        },
        include: {
          client: {
            omit: {
              tenantId: true,
            },
          },
          author: {
            omit: {
              password: true,
              tenantId: true,
            },
          },
          documents: {
            omit: {
              prospectionId: true,
              storedName: true,
            },
          },
          comments: {
            select: {
              id: true,
              content: true,
              createdAt: true,
              author: {
                select: {
                  id: true,
                  fullname: true,
                  email: true,
                },
              },
            },
            orderBy: {
              id: 'desc',
            },
          },
        },
      });
    } catch (err) {
      console.log('Error while fetching the prospection: ', err);
      throw new InternalServerErrorException(
        'Error while fetching the prospection.',
      );
    }
  }

  // -
  async createComment(
    createCommentDto: CreateCommentDTO,
    prospectionId: number,
    authorId: number,
  ) {
    try {
      return await this.prismaClientService.comment.create({
        data: {
          content: createCommentDto.content,
          authorId,
          prospectionId,
        },
      });
    } catch (err) {
      console.log('Error while creating the comment: ', err);
      throw new InternalServerErrorException(
        'Error while creating the comment.',
      );
    }
  }

  // -
  async findCommentsByProspectionId(prospectionId: number) {
    try {
      return await this.prismaClientService.comment.findMany({
        where: {
          prospectionId,
        },
        select: {
          id: true,
          content: true,
          author: {
            select: {
              id: true,
              fullname: true,
              email: true,
            },
          },
          createdAt: true,
        },
      });
    } catch (err) {
      console.log('Error while fetching the comments: ', err);
      throw new InternalServerErrorException(
        'Error while fetching the comments.',
      );
    }
  }

  // -
  async createDocument(prospectionId: number, file: Express.Multer.File) {
    let fileMetadata: FileMetadata = {
      originalName: '',
      storedName: '',
      size: 0,
      mimetype: '',
    };
    try {
      fileMetadata = await this.s3ClientService.save(file);

      return await this.prismaClientService.document.create({
        data: {
          originalName: file.originalname,
          storedName: fileMetadata.storedName,
          size: file.size,
          mimetype: file.mimetype,
          prospectionId,
        },
      });
    } catch (err) {
      if (fileMetadata.storedName.length > 0) {
        await this.s3ClientService.delete(fileMetadata.storedName);
      }
      console.log('Error while uploading the file: ', err);
      throw new InternalServerErrorException('Error while uploading the file.');
    }
  }

  // -
  async deleteDocument(prospectionId: number, documentId: number) {
    try {
      const document = await this.prismaClientService.document.findUnique({
        where: {
          id: documentId,
          prospectionId,
        },
      });

      if (!document) {
        throw new NotFoundException('File not found!');
      }
      
      return await this.s3ClientService.delete(document.storedName);
    } catch (err) {
      console.log('Error while deleting the file: ', err);
      throw new InternalServerErrorException('Error while deleting the file.');
    }
  }
}
