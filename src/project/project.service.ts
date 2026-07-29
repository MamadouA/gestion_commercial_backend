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
import { InvoiceWhereInput, JournalEventWhereInput, ProjectCreateInput, ProjectUpdateInput } from '../generated/prisma/models';
import { User } from '../generated/prisma/client';
import { connect } from 'http2';
import { CreateInvoiceDTO } from '../invoice/dto/create-invoice.dto';
import { InvoiceQueryDTO } from '../invoice/dto/invoice.query.dto';
import { JournalEventQueryDTO } from './dto/journal-event-query.dto';
import { CreateJournalEventDTO } from './dto/create-journal-event.dto';

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
        orderBy: {
          id: 'desc',
        }
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
    user: User,
    contractDocument: Express.Multer.File,
  ) {
    let fileMetadata: FileMetadata | null = null;

    try {
      if(!contractDocument) {
        throw new BadRequestException('Contract document is required.');
      }

      const offer = await this.prismaClientService.offer.findFirstOrThrow({
        where: { id: offerId, tenantId: user.tenantId },
      });

      if(offer.status === "CANCELLED" || offer.status === "LOST" || offer.status === "WON") {
        throw new BadRequestException('Offer is already closed.');
      }

      fileMetadata = await this.s3ClientService.save(contractDocument);
      const projectData: ProjectCreateInput = {
        title: offer.title,
        description: offer.description,
        amountExcludingTax: offer.amountExcludingTax,
        vatAmount: offer.vatAmount,
        amountIncludingTax: offer.amountIncludingTax,
        offer: {
          connect: {
            id: offerId,
          },
        },
        client: {
          connect: {
            id: offer.clientId,
          },
        },
        tenant: {
          connect: {
            id: user.tenantId,
          },
        },
        journalEvents: {
          create: {
            event: "Contract Signé",
            document: {
              create: fileMetadata
            },
            author: {
              connect: {
                id: user.id,
              },
            }
          }
        }
      };

      const result  = await this.prismaClientService.$transaction([
        this.prismaClientService.offer.update({
          where: {
            id: offerId,
            tenantId: user.tenantId,
          },
          data: {
            status: "WON"
          }
        }), 

        this.prismaClientService.project.create({
          data: projectData,
          select: {
            id: true,
            title: true,
            createdAt: true,
            status: true,
            client: {
              select: {
                id: true,
                type: true,
                enterpriseName: true,
                contactName: true,
              },
            }
          }
        })
      ]);

      return result[1];
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
    journalEventDTO: CreateJournalEventDTO,
    file: Express.Multer.File,
    user: User,
  ) {
    let fileMetadata: FileMetadata | null = null;

    try {
      fileMetadata = await this.s3ClientService.save(file);

      const project = await this.prismaClientService.project.findFirstOrThrow({
        where: { id, tenantId: user.tenantId },
      });

      if(!project) {
        throw new NotFoundException('Project not found.');
      }

      return await this.prismaClientService.journalEvent.create({
        data: {
          project: {
            connect: {
              id,
            },
          },
          event: journalEventDTO.event,
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
          }
        }
      })
    }
    catch(err) {
      if(fileMetadata) {
        await this.s3ClientService.delete(fileMetadata.storedName);
      }

      this.logger.error('Error while creating the journal event: ', err);
      throw new InternalServerErrorException(
        'Error while creating the journal event.',
      );
    }
  }

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
    const filter: InvoiceWhereInput = { project: { id, tenantId } };

    if(query.description && query.description.length) {
      filter.description = {
        contains: query.description,
        mode: 'insensitive'
      }
    }

    if(query.createdAt) {
      filter.createdAt = {
        lte: new Date(query.createdAt),
      }
    }

    if(query.status) {
      filter.status = query.status
    }
    
    try {
      const invoices = await this.prismaClientService.invoice.findMany({
        where: filter,
        select: {
          id: true,
          description: true,
          amount: true,
          createdAt: true,
          status: true,
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
        }
      });

      const count = await this.prismaClientService.invoice.count({
        where: { project: { id, tenantId } },
      })

      return { invoices, count };
    } catch (err) {
      this.logger.error('Error while fetching the invoices: ', err);
      throw new InternalServerErrorException(
        'Error while fetching the invoices.',
      );
    }
  }

  // -
  async getinvoiceDocumentUrl(id: number, invoiceId: number, tenantId: number) {
    try {
      const invoice = await this.prismaClientService.invoice.findUnique({
        where: { id: invoiceId, project: { id, tenantId } },
        select: {
          document: {
            select: {
              storedName: true,
            },
          },
        }
      });

      if (!(invoice && invoice.document)) {
        throw new NotFoundException('Invoice not found.');
      }

      return await this.s3ClientService.generateDownloadUrl(
        invoice.document.storedName
      )
    }
    catch(err) {

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
                storedName: true
              },
            },
          },
        });

        if (!(journalEvent && journalEvent.document) ) {
          throw new NotFoundException('Journal event not found.');
        }

      return await this.s3ClientService.generateDownloadUrl(
        journalEvent.document.storedName,
      );
    } catch (err) {
      this.logger.error('Error while fetching the document: ', err);
      throw new InternalServerErrorException(
        'Error while fetching the document.',
      );
    }
  }
}
