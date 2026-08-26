import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaClientService } from '../database/prisma-client.service';
import { S3ClientService } from '../common/file-manager/s3-client.service';
import { FileMetadata } from '../shared/shared.types';
import {  ProjectCreateInput } from '../generated/prisma/models';
import { User } from '../generated/prisma/client';
import { CurrentUserType } from '../auth/auth.types';
import { getPastMonday } from '../utils/getPastMonday';
import { getNextSunday } from '../utils/getNextSunday';
import { UpdateTimesheetDTO } from './dto/update-timesheet.dto';

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
        reports: {
          create: {
            description: 'Contrat signé',
            document: {
              create: fileMetadata,
            },
            author: {
              connect: {
                id: user.id,
              },
            },
            tenant: {
              connect: {
                id: user.tenantId,
              },
            },
          },
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

  // -
  async findCurrentUserTimesheets(projectId: number, user: CurrentUserType) {
    try {
      return await this.prismaClientService.timesheet.findMany({
        where: { projectId, ownerId: user.id }
      });
    }
    catch(err) {
      this.logger.error("Error while fetching the timesheet: ", err);
      throw new InternalServerErrorException("Error while fetching the timehseet.");
    }
  }

  // -
  async updateTimesheet(projectId: number, timesheetId: number, updateTimesheetDTO: UpdateTimesheetDTO, user: CurrentUserType) {
    try {
      const temesheet = await this.prismaClientService.timesheet.findFirstOrThrow({
        where: { id: timesheetId, projectId, ownerId: user.id }
      });

      return await this.prismaClientService.timesheet.update({
        where: { id: temesheet.id },
        data: {
          [updateTimesheetDTO.day]: updateTimesheetDTO.value
        }
      });
    }
    catch(err) {
      this.logger.error("Error while updating the timesheet: ", err);
      throw new InternalServerErrorException("Error while updating the timehseet.");
    }
  }

  // -
  async createTimesheet(projectId: number, user: CurrentUserType) {
    try {
      const existingTimesheet = await this.prismaClientService.timesheet.findFirst({
        where: { 
          projectId, 
          startDate: {
            gte: getPastMonday()
          },
          endDate: {
            lte: getNextSunday()
          }
        },
        omit: {
          projectId: true,     
        }
      });

      if(existingTimesheet) {
        throw new BadRequestException("Timesheet already created for this week!");
      }

      return await this.prismaClientService.timesheet.create({
        data: {
          startDate: getPastMonday(),
          endDate: getNextSunday(),
          owner: {
            connect: {
              id: user.id
            }
          },
          project: {
            connect: {
              id: projectId
            }
          }
        }
      })
    }
    catch(err) {
      this.logger.error("Error while creating the timesheet", err);
      throw new InternalServerErrorException("Error while creating the timesheet.");
    }
  }
}
