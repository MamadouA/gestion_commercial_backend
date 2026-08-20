import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaClientService } from '../../database/prisma-client.service';
import { CreateOfferDTO } from './dto/create-offer.dto';
import { UpdateOfferDTO } from './dto/update-offer.dto';
import { S3ClientService } from '../../common/file-manager/s3-client.service';
import { OfferQueryDTO } from './dto/offer-query.dto';
import {
  OfferUpdateInput,
  OfferWhereInput,
} from '../../generated/prisma/models';
import { type FileMetadata } from '../../shared/shared.types';
import { create } from 'domain';
import { Offer } from '../../generated/prisma/client';
import { CurrentUserType } from '../../auth/auth.types';

@Injectable()
export class OfferService {
  private logger = new Logger(OfferService.name);

  constructor(
    private readonly prismaClientService: PrismaClientService,
    private readonly s3ClientService: S3ClientService,
  ) {}

  // -
  async findAll(query: OfferQueryDTO, tenantId: number) {
    const filter: OfferWhereInput = { tenantId };

    if (
      query.contactNameOrEnterpriseName &&
      query.contactNameOrEnterpriseName.length
    ) {
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

    if (query.authorName && query.authorName.length) {
      filter.author = {
        fullname: {
          contains: query.authorName,
          mode: 'insensitive',
        },
      };
    }

    if (query.status && query.status.length) {
      filter.status = query.status;
    }

    if (query.expiryDate && query.expiryDate.length) {
      filter.expiryDate = {
        lte: new Date(query.expiryDate),
      };
    }

    try {
      const offers = await this.prismaClientService.offer.findMany({
        where: filter,
        select: {
          id: true,
          title: true,
          status: true,
          amountTTC: true,
          expiryDate: true,
          client: {
            select: {
              type: true,
              enterpriseName: true,
              contactName: true,
            },
          },
          author: {
            select: {
              id: true,
              fullname: true,
            },
          },
        },
        orderBy: {
          id: 'desc',
        },
      });

      const count = await this.prismaClientService.offer.count({
        where: {
          tenantId,
        },
      });

      return {
        offers,
        count,
      };
    } catch (err) {
      this.logger.error('Error while fetching the offers: ', err);
      throw new InternalServerErrorException(
        'Error while fetching the offers.',
      );
    }
  }

  //
  async create(
    createOfferDto: CreateOfferDTO,
    file: Express.Multer.File,
    authorId: number,
    tenantId: number,
  ) {
    let fileMetadata: FileMetadata | null = null;

    try {
      const data = {
        title: createOfferDto.title,
        clientId: createOfferDto.clientId,
        expiryDate: new Date(createOfferDto.expiryDate),
        amountHT: createOfferDto.amountHT,
        amountTVA: createOfferDto.amountVAT,
        amountTTC:
          createOfferDto.amountHT + createOfferDto.amountVAT,
        authorId,
        tenantId,
      };

      if (file) {
        fileMetadata = await this.s3ClientService.save(file);
        data['documents'] = {
          create: fileMetadata,
        };
      }

      return await this.prismaClientService.offer.create({
        data,
        omit: {
          tenantId: true,
        },
      });
    } catch (err) {
      if (fileMetadata) {
        await this.s3ClientService.delete(fileMetadata.storedName);
      }
      this.logger.error('Error while creating the offer: ', err);
      throw new InternalServerErrorException('Error while creating the offer.');
    }
  }

  //
  async findOne(id: number, tenantId: number) {
    try {
      return await this.prismaClientService.offer.findUnique({
        where: {
          id,
          tenantId,
        },
        omit: {
          tenantId: true,
          authorId: true,
          clientId: true,
        },
        include: {
          author: {
            select: {
              id: true,
              fullname: true,
              email: true,
            },
          },
          client: {
            select: {
              id: true,
              type: true,
              enterpriseName: true,
              contactName: true,
              email: true,
              phone: true,
            },
          },
          comments: {
            select: {
              id: true,
              content: true,
              createdAt: true,
              offerId: true,
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
          products: {
            select: {
              id: true,
              title: true,
              domain: true,
            },
            orderBy: {
              id: 'desc',
            },
          },
          documents: {
            omit: {
              storedName: true,
            },
            orderBy: {
              id: 'desc',
            },
          },
        },
      });
    } catch (err) {
      this.logger.error('Error while fetching the offer: ', err);
      throw new InternalServerErrorException('Error while fetching the offer.');
    }
  }

  // -
  async update(
    id: number,
    updateOfferDto: UpdateOfferDTO,
    user: CurrentUserType,
  ) {
    const updates: OfferUpdateInput = {};

    if (updateOfferDto.title) {
      updates['title'] = updateOfferDto.title;
    }

    if (updateOfferDto.amountIncludingTax) {
      updates['amountIncludingTax'] = updateOfferDto.amountIncludingTax;
    }

    if (updateOfferDto.amountExcludingTax) {
      updates['amountExcludingTax'] = updateOfferDto.amountExcludingTax;
    }

    if (updateOfferDto.vatAmount) {
      updates['vatAmount'] = updateOfferDto.vatAmount;
    }

    try {
      if (updateOfferDto.status && updateOfferDto.status !== "PENDING") {
        if(user.role.name !== "ADMIN") {
            throw new UnauthorizedException('You are not authorized to mark the offer as pending.');
        }
      
        await this.prismaClientService.project.deleteMany({
          where: {
            offerId: id,
            tenantId: user.tenantId
          },
        });

        updates['status'] = updateOfferDto.status;
      }

      if (Object.keys(updates).length) {
        return await this.prismaClientService.offer.update({
          where: {
            id,
            tenantId: user.tenantId,
          },
          data: updates,
          omit: {
            tenantId: true,
            authorId: true,
            clientId: true,
          },
          include: {
            author: {
              select: {
                id: true,
                fullname: true,
                email: true,
              },
            },
            client: {
              select: {
                id: true,
                type: true,
                enterpriseName: true,
                contactName: true,
                email: true,
                phone: true,
              },
            },
            comments: {
              select: {
                id: true,
                content: true,
                createdAt: true,
                offerId: true,
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
            documents: {
              omit: {
                storedName: true,
              },
              orderBy: {
                id: 'desc',
              },
            },
          },
        });
      }

      return null;
    } catch (err) {
      this.logger.error('Error while updating the offer: ', err);
      throw new InternalServerErrorException('Error while updating the offer.');
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
      return (
        await this.prismaClientService.offer.update({
          where: {
            id,
            tenantId,
          },
          data: {
            documents: {
              create: fileMetadata,
            },
          },
          select: {
            documents: {
              select: {
                id: true,
                originalName: true,
                size: true,
                mimetype: true,
                offerId: true,
              },
              orderBy: {
                id: 'desc',
              },
            },
          },
        })
      ).documents[0]; // return the created document
    } catch (err) {
      if (fileMetadata) {
        await this.s3ClientService.delete(fileMetadata.storedName);
      }
      this.logger.error('Error while uploading the file: ', err);
      throw new InternalServerErrorException('Error while uploading the file.');
    }
  }
}
