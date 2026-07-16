import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaClientService } from '../../database/prisma-client.service';
import { CreateOfferDTO } from './dto/create-offer.dto';
import { UpdateOfferDTO } from './dto/update-offer.dto';
import { S3ClientService } from '../../common/file-manager/s3-client.service';
import { OfferQueryDTO } from './dto/offer-query.dto';
import { OfferWhereInput } from '../../generated/prisma/models';
import { FileMetadata } from '../../shared/shared.types';

@Injectable()
export class OfferService {
  constructor(
    private readonly prismaClientService: PrismaClientService,
    private readonly s3ClientService: S3ClientService,
  ) {}

  // -
  async findAll(query: OfferQueryDTO, tenantId: number) {
    const filter: OfferWhereInput = { tenantId };

    if(query.contactNameOrEnterpriseName && query.contactNameOrEnterpriseName.length) {
      filter.OR = [
        {
          client: {
            enterpriseName: {
              contains: query.contactNameOrEnterpriseName,
              mode: 'insensitive'
            }
          } 
        },
        {
          client: {
            contactName: {
              contains: query.contactNameOrEnterpriseName,
              mode: 'insensitive'
            }
          }
        }
      ]
    }

    if(query.authorName && query.authorName.length) {
      filter.author = {
        fullname: {
          contains: query.authorName,
          mode: 'insensitive'
        }
      }
    }

    if(query.status && query.status.length) {
      filter.status = query.status
    }

    if(query.expiryDate && query.expiryDate.length) {
      filter.expiryDate = {
        lte: new Date(query.expiryDate)
      }
    }
        
    try {
      const offers = await this.prismaClientService.offer.findMany({
        where: filter,
        select: {
          id: true,
          title: true,
          status: true,
          amountIncludingTax: true,
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
        }
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
      console.log('Error while fetching the offers: ', err);
      throw new InternalServerErrorException(
        'Error while fetching the offers.',
      );
    }
  }

  //
  async create(
    createOfferDto: CreateOfferDTO,
    files: Array<Express.Multer.File>,
    authorId: number,
    tenantId: number,
  ) {
    let fileMetadatas: FileMetadata[] = [];

    try {
      fileMetadatas = await this.s3ClientService.bulkSave(files);

      return await this.prismaClientService.offer.create({
        data: {
          title: createOfferDto.title,
          description: createOfferDto.description,
          clientId: createOfferDto.clientId,
          expiryDate: new Date(createOfferDto.expiryDate),
          amountExcludingTax: createOfferDto.amountExcludingTax,
          vatAmount: createOfferDto.vatAmount,
          amountIncludingTax: createOfferDto.amountExcludingTax + createOfferDto.vatAmount,
          documents: {
            createMany: {
              data: fileMetadatas,
            },
          },
          authorId,
          tenantId,
        },
        omit: {
          tenantId: true,
        },
      });
    } catch (err) {
      if(fileMetadatas.length) {
        await this.s3ClientService.bulkDelete(fileMetadatas);
      }
      
      console.log('Error while creating the offer: ', err);
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
          members: {
            select: {
              id: true,
              fullname: true,
              email: true,
              phone: true,
              roles: true,
            },
            orderBy: {
              id: 'desc',
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
      console.log('Error while fetching the offer: ', err);
      throw new InternalServerErrorException('Error while fetching the offer.');
    }
  }

  // -
  async update(
    id: number,
    updateOfferDto: UpdateOfferDTO,
    authorId: number,
    tenantId: number,
  ) {
    const updates = {
      title: updateOfferDto.title,
      description: updateOfferDto.description,
      amountIncludingTax: updateOfferDto.amountIncludingTax,
      amountExcludingTax: updateOfferDto.amountExcludingTax,
      vatAmount: updateOfferDto.vatAmount,
      expiryDate: updateOfferDto.expiryDate,
      members: {
        set: updateOfferDto.memberIds?.map((id) => ({ id })),
      },
      products: {
        set: updateOfferDto.productIds?.map((id) => ({ id })),
      },
    };

    if (updateOfferDto.comment?.content) {
      updates['comments'] = {
        create: {
          content: updateOfferDto.comment.content,
          authorId,
        },
      };
    }

    try {
      return await this.prismaClientService.offer.update({
        where: {
          id,
          tenantId,
        },
        data: updates,
      });
    } catch (err) {
      console.log('Error while updating the offer: ', err);
      throw new InternalServerErrorException('Error while updating the offer.');
    }
  }
}
