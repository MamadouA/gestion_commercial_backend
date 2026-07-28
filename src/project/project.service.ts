import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientService } from '../database/prisma-client.service';
import { S3ClientService } from '../common/file-manager/s3-client.service';
import { FileMetadata } from '../shared/shared.types';
import { UpdateProjectDTO } from './dto/update-project.dto';
import { JournalEventWhereInput, ProjectUpdateInput } from '../generated/prisma/models';
import { User } from '../generated/prisma/client';
import { connect } from 'http2';
import { CreateInvoiceDTO } from '../invoice/dto/create-invoice.dto';
import { InvoiceQueryDTO } from '../invoice/dto/invoice.query.dto';
import { JournalEventQueryDTO } from './dto/journal-event-query.dto';

@Injectable()
export class ProjectService {
  private logger = new Logger(ProjectService.name);

  constructor(
    private readonly prismaClientService: PrismaClientService,
    private readonly s3ClientService: S3ClientService,
  ) {}

  // -
  async findAll(tenantId: number) {
    try {
      const projects = await this.prismaClientService.project.findMany({
        where: { tenantId },
        omit: {
          tenantId: true,
          description: true,
        },
        include: {
          client: {
            select: {
              id: true,
              type: true,
              enterpriseName: true,
              contactName: true,
            },
          },
        },
      });

      const count = await this.prismaClientService.project.count({
        where: { tenantId },
      });
      return { projects, count };
    } catch (err) {
      this.logger.error('Error while fetching the projects: ', err);
      throw new InternalServerErrorException(
        'Error while fetching the projects.',
      );
    }
  }

  // - a project is created from an existing offer
  async create(
    offerId: number,
    tenantId: number,
    contractDocument: Express.Multer.File,
  ) {
    let fileMetadata: FileMetadata | null = null;

    try {
      const offer = await this.prismaClientService.offer.findFirstOrThrow({
        where: { id: offerId, tenantId },
      });

      const projectData = {
        title: offer.title,
        description: offer.description,
        offerId,
        clientId: offer.clientId,
        tenantId,
      };

      if (contractDocument) {
        fileMetadata = await this.s3ClientService.save(contractDocument);
        projectData['documents'] = { create: fileMetadata };
      }

      return await this.prismaClientService.project.create({
        data: projectData,
      });
    } catch (err) {
      if (fileMetadata) {
        await this.s3ClientService.delete(fileMetadata.storedName);
      }
      this.logger.error('Error while creating the project: ', err);
      throw new InternalServerErrorException(
        'Error while creating the project.',
      );
    }
  }

  // -
  async findOne(id: number, tenantId: number) {
    try {
      return await this.prismaClientService.project.findFirstOrThrow({
        where: { id, tenantId },
        omit: {
          tenantId: true,
        },
        include: {
          client: {
            omit: {
              tenantId: true,
            },
          },
          journalEvents: {
            select: {
              id: true,
              event: true,
              createdAt: true,
              author: {
                select: {
                  id: true,
                  fullname: true,
                  email: true,
                },
              },
              document: {
                select: {
                  id: true,
                  originalName: true,
                  createdAt: true,
                  size: true,
                  mimetype: true,
                },
              },
            },
            orderBy: {
              id: 'desc',
            },
          },
          invoices: {
            select: {
              id: true,
              description: true,
              amount: true,
              status: true,
              createdAt: true,
              author: {
                select: {
                  id: true,
                  fullname: true,
                  email: true,
                },
              },
              document: {
                select: {
                  id: true,
                  originalName: true,
                  createdAt: true,
                  size: true,
                  mimetype: true,
                },
              },
            },
            orderBy: {
              id: 'desc',
            },
          },
          documents: {
            select: {
              id: true,
              originalName: true,
              createdAt: true,
              size: true,
              mimetype: true,
            },
            orderBy: {
              id: 'desc',
            },
          },
        },
      });
    } catch (err) {
      this.logger.error('Error while fetching the project: ', err);
      throw new InternalServerErrorException(
        'Error while fetching the project.',
      );
    }
  }

  // -
  async createJournalEvent(
    id: number,
    updateDTO: UpdateProjectDTO,
    file: Express.Multer.File,
    tenantId: number,
  ) {}

  // -
  async createInvoice(
    id: number,
    invoiceDTO: CreateInvoiceDTO,
    file: Express.Multer.File,
    user: User,
  ) {
    let fileMetadata: FileMetadata | null = null;

    if (!file) {
      throw new BadRequestException('File is required.');
    }

    try {
      fileMetadata = await this.s3ClientService.save(file);

      const project = await this.prismaClientService.project.findUnique({
        where: { id, tenantId: user.tenantId },
      });

      if (!project) {
        throw new NotFoundException('Project not found.');
      }

      const invoice = await this.prismaClientService.invoice.create({
        data: {
          project: {
            connect: {
              id,
            },
          },
          description: invoiceDTO.description,
          amount: invoiceDTO.amount,
          status: invoiceDTO.status,
          author: {
            connect: {
              id: user.id,
            },
          },
          document: {
            create: fileMetadata,
          },
        },
        select: {
          id: true,
          description: true,
          amount: true,
          createdAt: true,
          status: true,
          author: {
            select: {
              id: true,
              fullname: true,
              email: true,
            },
          },
          document: {
            select: {
              id: true,
              originalName: true,
              createdAt: true,
              size: true,
              mimetype: true,
            },
          },
        },
      });

      return invoice;
    } catch (err) {
      if (fileMetadata) {
        await this.s3ClientService.delete(fileMetadata.storedName);
      }
      this.logger.error('Error while creating the invoice: ', err);
      throw new InternalServerErrorException(
        'Error while creating the invoice.',
      );
    }
  }

  // -
  async getJournalEvents(id: number, tenantId: number, query: JournalEventQueryDTO) {
    const filter: JournalEventWhereInput = { project: { id, tenantId } };

    try {

      if(query.event && query.event.length) {
        filter.event = {
          contains: query.event,
          mode: 'insensitive'
        }
      }

      if(query.createdAt && query.createdAt.length) {
          filter.createdAt = {
            lte: new Date(query.createdAt),
          }
      }

      const journalEvents = await this.prismaClientService.journalEvent.findMany({
        where: filter,
        select: {
            id: true,
            event: true,
            createdAt: true,
            projectId: true,
            author: {
              select: {
                id: true,
                fullname: true,
                email: true,
              },
            },
            document: {
              select: {
                id: true,
                originalName: true,
                createdAt: true,
                size: true,
                mimetype: true,
              },
            },
        },
        skip: (query.currentPage -1) * query.pageSize,
        take: query.pageSize,
        orderBy: {
          id: 'desc',
        },
      });

      const count = await this.prismaClientService.journalEvent.count({
          where: { project: { id, tenantId } },
      })

      return {
        journalEvents,
        count,
      };
    } catch (err) {
      this.logger.error('Error while fetching the journal events: ', err);
      throw new InternalServerErrorException(
        'Error while fetching the journal events.',
      );
    }
  }

  // -
  async getInvoices(id: number, tenantId: number, query: InvoiceQueryDTO) {
    try {
      const project = await this.prismaClientService.project.findUnique({
        where: { id, tenantId },
        select: {
          invoices: {
            select: {
              id: true,
              description: true,
              amount: true,
              createdAt: true,
              status: true,
              author: {
                select: {
                  id: true,
                  fullname: true,
                  email: true,
                },
              },
              document: {
                select: {
                  id: true,
                  originalName: true,
                  createdAt: true,
                  size: true,
                  mimetype: true,
                },
              },
            },
          },
        },
      });

      if (!project) {
        throw new NotFoundException('Project not found.');
      }

      return { invoices: project.invoices, count: project.invoices.length };
    } catch (err) {
      this.logger.error('Error while fetching the invoices: ', err);
      throw new InternalServerErrorException(
        'Error while fetching the invoices.',
      );
    }
  }

  // -
  async getDocuments(id: number, tenantId: number) {
    try {
      const project = await this.prismaClientService.project.findUnique({
        where: { id, tenantId },
        select: {
          documents: {
            select: {
              id: true,
              originalName: true,
              createdAt: true,
              size: true,
              mimetype: true,
            },
          },
        },
      });

      if (!project) {
        throw new NotFoundException('Project not found.');
      }

      return project.documents;
    } catch (err) {
      this.logger.error('Error while fetching the documents: ', err);
      throw new InternalServerErrorException(
        'Error while fetching the documents.',
      );
    }
  }

  // -
  async createDocument(
    id: number,
    file: Express.Multer.File,
    tenantId: number,
  ) {
    let fileMetadata: FileMetadata | null = null;

    try {
      fileMetadata = await this.s3ClientService.save(file);

      const project = await this.prismaClientService.project.findUnique({
        where: { id, tenantId },
      });

      if (!project) {
        throw new NotFoundException('Project not found.');
      }

      return await this.prismaClientService.document.create({
        data: {
          project: {
            connect: {
              id,
            },
          },
          ...fileMetadata,
        },
        select: {
          id: true,
          originalName: true,
          createdAt: true,
          size: true,
          mimetype: true,
        },
      });
    } catch (err) {
      if (fileMetadata) {
        await this.s3ClientService.delete(fileMetadata.storedName);
      }
      this.logger.error('Error while creating the document: ', err);
      throw new InternalServerErrorException(
        'Error while creating the document.',
      );
    }
  }

  // -
  async getDocumentDownLoadUrl(
    id: number,
    documentId: number,
    tenantId: number,
  ) {
    try {
      const project = await this.prismaClientService.project.findUnique({
        where: { id, tenantId, documents: { some: { id: documentId } } },
      });

      if (!project) {
        throw new NotFoundException('Project not found.');
      }

      return this.s3ClientService.generateDownloadUrl(documentId);
    } catch (err) {
      this.logger.error('Error while fetching the document: ', err);
      throw new InternalServerErrorException(
        'Error while fetching the document.',
      );
    }
  }

  // -
  async getJournalEventDocumentUrl(
    id: number,
    journalId: number,
    tenantId: number,
  ) {
    try {
        const journalEvent = await this.prismaClientService.journalEvent.findUnique({
          where: { id: journalId, project: { id, tenantId }  },
          select: {
            document: {
              select: {
                id: true,
                originalName: true,
                createdAt: true,
                size: true,
                mimetype: true,
              },
            },
          },
        });

        if (!(journalEvent && journalEvent.document) ) {
          throw new NotFoundException('Journal event not found.');
        }

      return await this.s3ClientService.generateDownloadUrl(
        journalEvent.document.id,
      );
    } catch (err) {
      this.logger.error('Error while fetching the document: ', err);
      throw new InternalServerErrorException(
        'Error while fetching the document.',
      );
    }
  }
}
