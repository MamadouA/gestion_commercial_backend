import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaClientService } from '../database/prisma-client.service';

@Injectable()
export class DashboardService {
  private logger = new Logger(DashboardService.name);

  constructor(private readonly prismaClientService: PrismaClientService) {}

  // -
  async getData (tenantId: number) {
    try {
      const counts = this.getTotalOverview(tenantId);
      const projectOverview = this.getProjectOverview(tenantId);
      const offerOverview = this.getOfferOverview(tenantId);
      const prospectionOverview = this.getProspectionOverview(tenantId);
      const invoiceOverview = this.getInvoiceOverview(tenantId);

      const result = await  Promise.all([counts, projectOverview, offerOverview, prospectionOverview, invoiceOverview]);
      
      return { counts: result[0], projects: result[1], offers: result[2], prospections: result[3], invoices: result[4] };
    }
    catch(err) {
      this.logger.error("Error while fetching the overview: ", err);
      throw new InternalServerErrorException("Error while fetching the overview.");
    }                                                              
  }

  // -
  async getTotalOverview(tenantId: number) {
    const userCount = this.prismaClientService.user.count({
      where: { tenantId },
    });

    const clientCount = this.prismaClientService.client.count({
      where: { tenantId },
    });

    const prospectionCount = this.prismaClientService.prospection.count({
      where: { tenantId },
    });

    const offerCount = this.prismaClientService.offer.count({
      where: { tenantId },
    });

    const projectCount = this.prismaClientService.project.count({
      where: { tenantId },
    });

    const invoiceCount = this.prismaClientService.invoice.count({
      where: { project: { tenantId } },
    });

    const result = await this.prismaClientService.$transaction([
      userCount,
      clientCount,
      prospectionCount,
      offerCount,
      projectCount,
      invoiceCount
    ]);

    return {
      users: result[0],
      clients: result[1],
      prospections: result[2],
      offers: result[3],
      projects: result[4],
      invoices: result[5],
    };
  }

  // -
  async getProjectOverview(tenantId: number) {
    const inProgress = this.prismaClientService.project.count({
      where: { tenantId, status: 'IN_PROGRESS' },
    });

    const done = this.prismaClientService.project.count({
      where: { tenantId, status: 'DONE' },
    });

    const cancelled = this.prismaClientService.project.count({
      where: { tenantId, status: 'CANCELLED' },
    });

    const total = this.prismaClientService.project.count({ where: { tenantId } });

    const result = await this.prismaClientService.$transaction([
      inProgress,
      done,
      cancelled,
      total,
    ]);

    return [
      { status: "En cours", count: result[0] / result[3] * 100 },
      { status: "Terminée", count: result[1] / result[3] * 100 },
      { status: "Annulée", count: result[2] / result[3] * 100 },
    ];
}

  // -
  async getOfferOverview(tenantId: number) {
    const pending = this.prismaClientService.offer.count({
      where: { tenantId, status: 'PENDING' },
    });
    const ready = this.prismaClientService.offer.count({
      where: { tenantId, status: 'READY' },
    });
    const sent = this.prismaClientService.offer.count({
      where: { tenantId, status: 'SENT' },
    });
    const won = this.prismaClientService.offer.count({
      where: { tenantId, status: 'WON' },
    });
    const lost = this.prismaClientService.offer.count({
      where: { tenantId, status: 'LOST' },
    });
    const cancelled = this.prismaClientService.offer.count({
      where: { tenantId, status: 'CANCELLED' },
    });
    const overdue = this.prismaClientService.offer.count({
      where: { tenantId, status: 'OVERDUE' },
    });

    const total = this.prismaClientService.offer.count({
      where: { tenantId },
    });

    const result = await this.prismaClientService.$transaction([
      pending,
      ready,
      sent,
      won,
      lost,
      cancelled,
      overdue,
      total
    ]);

    return [
      { status: "En cours", count: (result[0] / result[7]) * 100 },
      { status: "Prête", count: (result[1] / result[7]) * 100 },
      { status: "Envoyée", count: (result[2] / result[7]) * 100 },
      { status: "Gagnée", count: result[3] / result[7] * 100 },
      { status: "Perdue", count: (result[4] / result[7]) * 100 },
      { status: "Annulée", count: (result[5] / result[7]) * 100 }, 
      { status: "En retard", count: (result[6] / result[7]) * 100 },
    ];
  }

  // -
  async getProspectionOverview(tenantId: number) {
    try {
      const opened = this.prismaClientService.prospection.count({
        where: { tenantId, status: 'OPENED' },
      });

      const won = this.prismaClientService.prospection.count({
        where: { tenantId, status: 'WON' },
      });

      const lost = this.prismaClientService.prospection.count({
        where: { tenantId, status: 'LOST' },
      });

      const cancelled = this.prismaClientService.prospection.count({
        where: { tenantId, status: 'CANCELLED' },
      });

      const total = this.prismaClientService.prospection.count({
        where: { tenantId }
      })

      const result = await this.prismaClientService.$transaction([
        opened,
        won,
        lost,
        cancelled,
        total
      ]);

      return [
        { status: "En cours", count: (result[0] / result[4]) * 100 },
        { status: "Gagnée", count: (result[1] / result[4]) * 100},
        { status: "Perdue", count: (result[2] / result[4]) * 100},
        { stats: "Abandonnée", count: (result[3] / result[4]) * 100},
      ];
    }
    catch (err) {
      this.logger.error("Error while fetching the propections overview: ", err);
    }
  }

  // -
  async getInvoiceOverview(tenantId: number) {
    try{
      const paid = this.prismaClientService.invoice.count({
        where: { project: { tenantId }, status: 'PAID' }
      });

      const unpdaid = this.prismaClientService.invoice.count({
        where: { project: { tenantId }, status: 'UNPAID' }
      });

      const total = this.prismaClientService.invoice.count({
        where: { project: { tenantId } }
      });

      const result = await this.prismaClientService.$transaction([
        paid,
        unpdaid,
        total
      ]);

      return [
        { status: "Payée", count: (result[0] / result[2]) * 100 },
        { status: "Impayée", count: (result[1] / result[2]) * 100},
      ];
    }
    catch(err) {
      this.logger.error("Error while fetching the invoice overview: ", err);
      throw new InternalServerErrorException("Error while fetching the invoice overview.");
    }
  }
}
