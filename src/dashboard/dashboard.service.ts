import { Injectable } from '@nestjs/common';
import { PrismaClientService } from '../database/prisma-client.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prismaClientService: PrismaClientService) {}

  // -
  async getOverview(tenantId: number) {
    const userCount = this.prismaClientService.user.count({
      where: { tenantId: tenantId },
    });
    const clientCount = this.prismaClientService.client.count({
      where: { tenantId: tenantId },
    });
    const prospectionCount = this.prismaClientService.prospection.count({
      where: { tenantId: tenantId },
    });
    const offerCount = this.prismaClientService.offer.count({
      where: { tenantId: tenantId },
    });
    const projectCount = this.prismaClientService.project.count({
      where: { tenantId: tenantId },
    });

    const result = await this.prismaClientService.$transaction([
      userCount,
      clientCount,
      prospectionCount,
      offerCount,
      projectCount,
    ]);

    return {
      userCount: result[0],
      clientCount: result[1],
      prospectionCount: result[2],
      offerCount: result[3],
      projectCount: result[4],
    };
  }

  // -
  async getProjectsByStatus(tenantId: number) {}

  // -
  async getOffersDistributionByStatus(tenantId: number) {
    const pending = this.prismaClientService.offer.count({
      where: { tenantId: tenantId, status: 'PENDING' },
    });
    const ready = this.prismaClientService.offer.count({
      where: { tenantId: tenantId, status: 'READY' },
    });
    const sent = this.prismaClientService.offer.count({
      where: { tenantId: tenantId, status: 'SENT' },
    });
    const won = this.prismaClientService.offer.count({
      where: { tenantId: tenantId, status: 'WON' },
    });
    const lost = this.prismaClientService.offer.count({
      where: { tenantId: tenantId, status: 'LOST' },
    });
    const abandoned = this.prismaClientService.offer.count({
      where: { tenantId: tenantId, status: 'ABANDONED' },
    });
    const overdue = this.prismaClientService.offer.count({
      where: { tenantId: tenantId, status: 'OVERDUE' },
    });

    const count = this.prismaClientService.offer.count({
      where: { tenantId: tenantId },
    });

    const result = await this.prismaClientService.$transaction([
      pending,
      ready,
      sent,
      won,
      lost,
      abandoned,
      overdue,
      count
    ]);

    return {
      pending: (result[0] / result[7]) * 100,
      ready: (result[1] / result[7]) * 100,
      sent: (result[2] / result[7]) * 100,
      won: result[3] / result[7] * 100,
      lost: (result[4] / result[7]) * 100,
      abandoned: (result[5] / result[7]) * 100, 
      overdue: (result[6] / result[7]) * 100,
    };
  }

  // -
  async getProspectionsByStatus() {
    return {};
  }
}
