import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaClientService } from '../database/prisma-client.service';
import { LeadQueryDTO } from './dto/lead-query.dto';

@Injectable()
export class LeadService {
    private logger = new Logger(LeadService.name);
    constructor(private readonly prismaClientService: PrismaClientService) {}

    // -
    async findAll(query: LeadQueryDTO, tenantId: number) {
        try {

        }
        catch(err) {
            this.logger.error("Error while fetching the leads: ", err);
            throw new InternalServerErrorException("Error while fetching the leads.");
        }
    }
}
