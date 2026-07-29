import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../shared/current-user.decoration';

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}
    
    @Get('stats')
    async getOverview(@CurrentUser('tenantId') tenantId: number) {
        return await this.dashboardService.getData(tenantId);
    }

    @Get('offers-distribution-by-status')
    async getOffersDistributionByStatus(@CurrentUser('tenantId') tenantId: number) {
        return await this.dashboardService.getData(tenantId);
    }
}
