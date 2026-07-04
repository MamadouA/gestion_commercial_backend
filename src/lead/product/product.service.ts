import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateProductDTO } from './dto/create-product.dto';
import { PrismaClientService } from '../../database/prisma-client.service';
import { SearchDTO } from '../../shared/dto/search.dto';

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

    // -
    async search(search: SearchDTO, tenantId: number) {
        const filter = {
            tenantId
        }

        if(search.keyword && search.keyword.length) {
            filter['title'] = {
                contains: search.keyword,
                mode: 'insensitive'
            }
        }

        try {
            return await this.prismaClientService.product.findMany({
                where: filter,
                omit: {
                    tenantId: true
                },
                skip: (search.currentPage - 1) * search.pageSize,
                take: search.pageSize
            });
        }
        catch(err) {
            console.log("Error while searching the product: ", err);
            throw new InternalServerErrorException("Error while searching the product.");
        }
    }
}
