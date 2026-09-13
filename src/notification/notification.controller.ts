import { Controller, Get } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CurrentUser } from '../shared/current-user.decoration';
import { CurrentUserType } from '../auth/auth.types';

@Controller('notification')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    // -
    @Get('mark-all-as-read')
    async markAllAsRead (@CurrentUser('tenantId') tenantId: number) {
        return this.notificationService.marAllAsRead(tenantId);
    }
}
