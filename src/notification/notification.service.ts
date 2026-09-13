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
    async marAllAsRead(tenantId: number) {
        try {
            return await this.prismaClientService.notification.updateMany({ 
                where: { tenantId, isRead: false },
                data: { isRead: true },
             });
        }
        catch(err) {
            this.logger.error('Error while marking the notifications as read: ', err);
            throw new InternalServerErrorException('Error while marking the notifications as read.');
        }
    }
}


