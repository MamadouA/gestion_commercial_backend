import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaClientService } from '../../database/prisma-client.service';
import { CreateProspectionDTO } from './dto/create-prospection.dto';

@Injectable()
export class ProspectionService {
    constructor(private prismaClientService: PrismaClientService) {}

    // -
    async create(createProspectionDto: CreateProspectionDTO, tenantId: number) {
        try {
            return await this.prismaClientService.prospection.create({
                data: {
                    clientId: createProspectionDto.clientIid,
                    endDate: createProspectionDto.endDate,
                    startDate: createProspectionDto.startDate,
                    proposedService: createProspectionDto.prosposedService,
                    tenantId
                },
                omit: {
                    tenantId: true
                }
            })
        }
        catch(err) {
            console.log("Error while creating the lead: ", err);
            throw new InternalServerErrorException("Error while creating the lead.");
        }
    }
}
