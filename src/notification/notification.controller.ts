import { Controller, Get } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CurrentUser } from '../shared/current-user.decoration';
import { CurrentUserType } from '../auth/auth.types';

@Controller('notification')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    //  -
    @Get('all')
    async findAll (@CurrentUser() user: CurrentUserType) {
        return this.notificationService.findAll(user, user.tenantId);
    }

    // -
    @Get('unread/count')
    async getNewCount (@CurrentUser() user: CurrentUserType) {
        return this.notificationService.getUnreadCount(user, user.tenantId);
    }
}
