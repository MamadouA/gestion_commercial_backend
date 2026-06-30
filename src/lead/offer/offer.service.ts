import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaClientService } from '../../database/prisma-client.service';
import { CreateOfferDTO } from './dto/create-offer.dto';

@Injectable()
export class OfferService {
    constructor (private readonly prismaClientService: PrismaClientService) {}

    // -
    async findAll(tenantId: number) {
        try {
            return await this.prismaClientService.offer.findMany({
                where: {
                    tenantId
                },
                select: {
                    title: true,
                    status: true,
                    amountIncludingTax: true,
                    expiryDate: true,
                    client: {
                        select: {
                            type: true,
                            enterpriseName: true,
                            contactName: true
                        }
                    },
                    author: {
                        select: {
                            fullname: true,
                        }
                    }
                }
            });
        }
        catch(err) {
            console.log("Error while fetching the offers: ", err);
            throw new InternalServerErrorException("Error while fetching the offers.");
        }
    }

    //
    async create(createOfferDto: CreateOfferDTO, authorId: number, tenantId: number) {
        try {
            return await this.prismaClientService.offer.create({
                data: {
                    title: createOfferDto.title,
                    description: createOfferDto.description,
                    clientId: createOfferDto.clientId,
                    expiryDate: createOfferDto.expiryDate,
                    authorId,
                    tenantId
                },
                omit: {
                    tenantId: true
                }
            });
        }
        catch(err) {
            console.log("Error while creating the offer: ", err);
            throw new InternalServerErrorException("Error while creating the offer.");
        }
    }
}
