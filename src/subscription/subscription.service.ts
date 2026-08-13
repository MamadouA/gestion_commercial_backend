import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaClientService } from '../database/prisma-client.service';
import { CreateSubscriptionDTO } from './dto/create-subscription.dto';
import { Feature, Role } from '../generated/prisma/client';

@Injectable()
export class SubscriptionService {
    private logger = new Logger(SubscriptionService.name);

    constructor(private readonly prismaClientService: PrismaClientService) {}

    // -
    async findAll() {
        try {
            return await this.prismaClientService.subscription.findMany({
                select: {
                    id: true,
                    name: true,
                    maxUserCount: true,
                    storage: true,
                    price: true,
                    features: true
                }
            });
        }
        catch(err) {
            this.logger.error('Error while fetching the subscriptions: ', err);
            throw new InternalServerErrorException('Error while fetching the subscriptions.');
        }
    }

    // -
    async create(createSubscriptionDTO: CreateSubscriptionDTO, role: Role) {
        try {
            if(role.name !== 'SUPERADMIN') {
                throw new UnauthorizedException('You are not authorized to create a subscription.');
            }

            createSubscriptionDTO.features.forEach((feature) => {
                if(!Object.keys(Feature).includes(feature)) {
                    throw new BadRequestException('Invalid feature.');
                }
            });

            return await this.prismaClientService.subscription.create({ data: createSubscriptionDTO });
        }
        catch(err) {
            this.logger.error('Error while creating the subscription: ', err);
            throw new InternalServerErrorException('Error while creating the subscription.');
        }
    }
}
