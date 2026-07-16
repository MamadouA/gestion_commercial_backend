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
  async getOffersByStatus(tenantId: number) {
    const pendding = this.prismaClientService.offer.count({
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

    const result = await this.prismaClientService.$transaction([
      pendding,
      ready,
      sent,
      won,
      lost,
      abandoned,
      overdue,
    ]);

    return {
      pendding: result[0],
      ready: result[1],
      sent: result[2],
      won: result[3],
      lost: result[4],
      abandoned: result[5],
      overdue: result[6],
    };
  }

  // -
  async getProspectionsByStatus() {
    return {};
  }
}
