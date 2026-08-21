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
        amountTTC: offer.amountTTC,
        amountTVA: offer.amountTVA,
        amountHT: offer.amountHT,
        author: {
          connect: {
            id: user.id,
          },
        },
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
      const project = await this.prismaClientService.project.findFirstOrThrow({
        where: { id, tenantId },
        omit: {
          tenantId: true,
          offerId: true,
          clientId: true,
        },
        include: {
          client: {
            omit: {
              tenantId: true,
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

      const totalInvoiceAmount = this.prismaClientService.invoice.aggregate({
        where: { project: { id } },
        _sum: { amount: true },
      });

      const unpaidInvoiceAmount = this.prismaClientService.invoice.aggregate({
        where: { project: { id }, status: 'UNPAID' },
        _sum: { amount: true },
      });

      const paidInvoiceAmount = this.prismaClientService.invoice.aggregate({
        where: { project: { id }, status: 'PAID' },
        _sum: { amount: true },
      });

      const result = await Promise.all([totalInvoiceAmount, unpaidInvoiceAmount, paidInvoiceAmount]);

      project['invoicesAmount'] = result[0]._sum.amount ?? 0;
      project['unpaidInvoicesAmount'] = result[1]._sum.amount ?? 0;
      project['paidInvoicesAmount'] = result[2]._sum.amount ?? 0;

      return project;
    } catch (err) {
      this.logger.error('Error while fetching the project: ', err);
      throw new InternalServerErrorException(
        'Error while fetching the project.',
      );
    }
  }
}
