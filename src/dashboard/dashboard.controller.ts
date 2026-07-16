import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../shared/current-user.decoration';

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get('overview')
    async getOverview(@CurrentUser('tenantId') tenantId: number) {
        return await this.dashboardService.getOverview(tenantId);
    }
}
