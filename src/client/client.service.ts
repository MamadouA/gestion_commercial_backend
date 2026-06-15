import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateClientDTO } from './dto/create-client.dto';
import { PrismaClientService } from '../database/prisma-client.service';

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
    async findAll(currentPage: number, pageSize: number, tenantId: number) {
        try {
            const clients = await this.prismaClientService.client.findMany({
                where: {
                    tenantId
                },
                skip: (currentPage - 1) * pageSize,
                take: pageSize,
                orderBy: {
                    id: 'asc'
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
