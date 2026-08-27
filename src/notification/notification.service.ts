import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaClientService } from '../database/prisma-client.service';
import { Role } from '../generated/prisma/client';
import { CurrentUserType } from '../auth/auth.types';
import { NotificationWhereInput } from '../generated/prisma/models';

@Injectable()
export class NotificationService {
    private logger = new Logger(NotificationService.name);

    constructor(private readonly prismaClientService: PrismaClientService) {}

    // -
    async findAll(user: CurrentUserType, tenantId: number) {
        try {
            const filter: NotificationWhereInput = { tenantId };

            if(user.role.permissions.some((permission) => permission.name === "offer.manage")) {
                filter.OR?.push({ feature: "OFFER" });
            }

            if(user.role.permissions.some((permission) => permission.name === "prospection.manage")) {
                filter.OR?.push({ feature: "PROSPECTION" });
            }

            return await this.prismaClientService.notification.findMany({ 
                where: filter,
                select: {
                    id: true,
                    feature: true,
                    message: true,
                    createdAt: true,
                    isRead: true
                },
                orderBy: { createdAt: 'desc' }
             });
        }
        catch(err) {
            this.logger.error('Error while fetching the notifications: ', err);
            throw new InternalServerErrorException('Error while fetching the notifications.');
        }
    }

    // -
    async getUnreadCount(user: CurrentUserType, tenantId: number) {
        try {
            const filter: NotificationWhereInput = { tenantId, isRead: false };

            if(user.role.permissions.some((permission) => permission.name === "offer.manage")) {
                filter.OR?.push({ feature: "OFFER" });
            }

            if(user.role.permissions.some((permission) => permission.name === "prospection.manage")) {
                filter.OR?.push({ feature: "PROSPECTION" });
            }

            
            const count = await this.prismaClientService.notification.count({ 
                where: filter,
            });

            return { count };
        }
        catch(err) {
            this.logger.error('Error while fetching the notifications: ', err);
            throw new InternalServerErrorException('Error while fetching the notifications.');
        }
    }
}


