import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaClientService } from '../../database/prisma-client.service';
import { CreateOfferDTO } from './dto/create-offer.dto';
import { UpdateOfferDTO } from './dto/update-offer.dto';
import { S3ClientService } from '../../common/file-uploader/s3-client.service';

@Injectable()
export class OfferService {
    constructor (private readonly prismaClientService: PrismaClientService, private readonly s3ClientService: S3ClientService) {}

    // -
    async findAll(tenantId: number) {
        try {
            const offers = await this.prismaClientService.offer.findMany({
                where: {
                    tenantId
                },
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
                            contactName: true
                        }
                    },
                    author: {
                        select: {
                            id: true,
                            fullname: true,
                        }
                    }
                }
            });

            const count = await this.prismaClientService.offer.count({
                where: {
                    tenantId
                }
            });

            return ({
                offers,
                count
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

    // 
    async findOne(id: number, tenantId: number) { 
        try {
            return await this.prismaClientService.offer.findUnique({
                where: {
                    id,
                    tenantId
                },
                omit: {
                    tenantId: true,
                    authorId: true,
                    clientId: true
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            fullname: true,
                            email: true,
                        }
                    },
                    client: {
                        select: {
                            id: true,
                            type: true,
                            enterpriseName: true,
                            contactName: true,
                            email: true,
                            phone: true
                        }
                    },
                    members: {
                        select: {
                            id: true,
                            fullname: true,
                            email: true,
                            phone: true,
                            roles: true
                        },
                        orderBy: {
                            id: 'desc'
                        }
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
                                }
                            }
                        },
                        orderBy: {
                            id: 'desc'
                        }
                    },
                    products: {
                        select: {
                            id: true,
                            title: true,
                            domain: true
                        },
                        orderBy: {
                            id: 'desc'
                        }
                    }
                }
            });
        }
        catch(err) {
            console.log("Error while fetching the offer: ", err);
            throw new InternalServerErrorException("Error while fetching the offer.");
        }
    }

    // -
    async update(id: number, updateOfferDto: UpdateOfferDTO, authorId: number, tenantId: number) {
        const updates = {
            title: updateOfferDto.title,
            description: updateOfferDto.description,
            amountIncludingTax: updateOfferDto.amountIncludingTax,
            amountExcludingTax: updateOfferDto.amountExcludingTax,
            vatAmount: updateOfferDto.vatAmount,
            expiryDate: updateOfferDto.expiryDate,
            members: {
                set: updateOfferDto.memberIds?.map((id) => ({ id }))
            },
            products: {
                set: updateOfferDto.productIds?.map((id) => ({ id }))
            }
        }   

        if(updateOfferDto.comment?.content) {
            updates['comments'] = {
                create: {
                    content: updateOfferDto.comment.content,
                    authorId
                }
            }
        }

        try {
            return await this.prismaClientService.offer.update({
                where: {
                    id,
                    tenantId
                },
                data: updates
            });
        }
        catch(err) {
            console.log("Error while updating the offer: ", err);
            throw new InternalServerErrorException("Error while updating the offer.");
        }
    }

    // -
    async removeFile(offerId: number, storedName: string, tenantId: number) {
        try {
            const updatedOffer = await this.prismaClientService.offer.update({
                where: {
                    id: offerId,
                    tenantId
                },
                data: {
                    documents: {
                         delete: {
                             storedName
                         }
                    }
                }
            });

            await this.s3ClientService.deleteFile(storedName);

            return updatedOffer;
        }
        catch(err) {
            console.log("Error while removing the file: ", err);
            throw new InternalServerErrorException("Error while removing the file.");
        }
    }
}
