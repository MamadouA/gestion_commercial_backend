import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateClientDTO } from './dto/create-client.dto';
import { PrismaClientService } from '../database/prisma-client.service';
import { PaginationDTO } from '../shared/dto/pagination'
import { ClientQueryDTO } from './dto/client-query.dto';

@Injectable()
export class ClientService {
    constructor(private prismaClientService: PrismaClientService) {}

    // -
    async create(createClientDto: CreateClientDTO, tenantId: number) {
        try {
            return await this.prismaClientService.client.create({
                data: {
                    ...createClientDto,
                    tenantId
                }
            })
        }
        catch(err) {
            console.log("Error while creating the clients: ", err);
            throw new InternalServerErrorException("Error while creating the clients.");
        }
    }

    // -
    async findAll(query: ClientQueryDTO, tenantId: number) {
        try {
            const filter = { tenantId }; // must

            if (query.type && query.type.length) {
                filter['type'] = query.type;
            }
            if (query.enterpriseName) {
                filter['enterpriseName'] = {
                    contains: query.enterpriseName,
                    mode: 'insensitive'
                }
            }
            if (query.email) {
                filter['email'] = {
                    contains: query.email,
                    mode: 'insensitive'
                }
            }
            if (query.country) {
                filter['country'] = {
                    contains: query.country,
                    mode: 'insensitive'
                }
            }

            const clients = await this.prismaClientService.client.findMany({
                where: filter,
                skip: (query.currentPage - 1) * query.pageSize,
                take: query.pageSize,
                orderBy: {
                    id: 'desc'
                }   
            });

            const count = await this.prismaClientService.client.count({
                where: {
                    tenantId
                }
            });

            return ({
                clients,
                count
            })
        }
        catch(err) {
            console.log("Error while fetching the clients: ", err);
            throw new InternalServerErrorException("Error while fetching the clients.");
        }
    }

    // -
    async findOne(id: number, tenantId: number) {
        try {
            return await this.prismaClientService.client.findUnique({
                where: {
                    id,
                    tenantId
                }
            });
        }
        catch(err) {
            console.log("Error while fetching the client: ", err);
            throw new InternalServerErrorException("Error while fetching the client.");
        }
    }
    
    // 
    async deleteOne(id: number, tenantId: number) {
        try {
            return await this.prismaClientService.client.delete({
                where: {
                    id,
                    tenantId
                }
            });
        }
        catch(err) {
            console.log("Error while deleting the client: ", err);
            throw new InternalServerErrorException("Error while deleting the client.");
        }
    }
}
