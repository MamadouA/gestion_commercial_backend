import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateProductDTO } from './dto/create-product.dto';
import { PrismaClientService } from '../../database/prisma-client.service';

@Injectable()
export class ProductService {
    constructor(private readonly prismaClientService: PrismaClientService) {}

    // -
    async create(createProductDto: CreateProductDTO, tenantId: number) {
        try {
            return await this.prismaClientService.product.create({
                data: {
                    ...createProductDto,
                    tenantId
                },
                omit: {
                    tenantId: true
                }
            });
        }
        catch(err) {
            console.log("Error while creating the product: ", err);
            throw new InternalServerErrorException("Error while creating the product.");
        }
    }

    // -
    async findAll(tenantId: number) {
        try {
            return await this.prismaClientService.product.findMany({
                where: {
                    tenantId
                },
                omit: {
                    tenantId: true
                }
            });
        }
        catch(err) {
            console.log("Error while fetching the product: ", err);
            throw new InternalServerErrorException("Error while fetching the product.");
        }
    }
}
