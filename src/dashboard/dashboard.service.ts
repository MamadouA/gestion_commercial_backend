import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaClientService } from '../database/prisma-client.service';
import { InvoiceStatus, OfferStatus, ProjectStatus, ProspectionStatus } from '../generated/prisma/enums';

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
      const revenues = this.getMonthlyRevenues(tenantId);  

      const result = await  Promise.all([counts, projectOverview, offerOverview, prospectionOverview, invoiceOverview, revenues]);

      return { counts: result[0], projects: result[1], offers: result[2], prospections: result[3], invoices: result[4], revenues: result[5] };
    }
    catch(err) {
      this.logger.error("Error while fetching the overview: ", err);
      throw new InternalServerErrorException("Error while fetching the overview.");
    }                                                              
  }

  async getMonthlyRevenues(tenantId: number) {
    const year = new Date().getUTCFullYear();
    const revenues = [
      { 'month': 'Janvier', 'revenue': 0 },
      { 'month': "Février", 'revenue': 0 },
      { 'month': 'Mars', 'revenue': 0 },
      { 'month': 'Avril', 'revenue': 0 },
      { 'month': 'Mai', 'revenue': 0 },
      { 'month': 'Juin', 'revenue': 0 },
      { 'month': 'Juillet', 'revenue': 0 },
      { 'month': 'Aout', 'revenue': 0 },
      { 'month': 'Septembre', 'revenue': 0 },
      { 'month': 'Octobre', 'revenue': 0 },
      { 'month': 'Novembre', 'revenue': 0 },
      { 'month': 'Décembre', 'revenue': 0 },
    ]

    const result = await this.prismaClientService.$queryRaw<{ month: number; revenue: number }[]>`
      SELECT
        EXTRACT(MONTH FROM "createdAt") AS month,
        SUM("amountHT") AS revenue
      FROM "Project"
      WHERE
        "status" = 'DONE'AND "tenantId" = ${tenantId}
        AND EXTRACT(YEAR FROM "createdAt") = ${year}
      GROUP BY EXTRACT(MONTH FROM "createdAt")
      ORDER BY month ASC;
    `;

    result.forEach(item => {
      revenues[item.month].revenue = item.revenue;
    });

    return revenues;
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


    const result = await Promise.all([
      inProgress,
      done,
      cancelled,
    ]);

    return [
      { status: ProjectStatus.IN_PROGRESS, count: result[0] },
      { status: ProjectStatus.DONE, count: result[1] },
      { status: ProjectStatus.CANCELLED, count: result[2] },
    ];
}

  // -
  async getOfferOverview(tenantId: number) {
    const pending = this.prismaClientService.offer.count({
      where: { tenantId, status: 'PENDING' },
    });

    const won = this.prismaClientService.offer.count({
      where: { tenantId, status: 'WON' },
    });
    const lost = this.prismaClientService.offer.count({
      where: { tenantId, status: 'LOST' },
    });

    const result = await Promise.all([
      pending,
      won,
      lost,
    ]);

    return [
      { status: OfferStatus.PENDING, count: result[0] },
      { status: OfferStatus.WON, count: result[1]},
      { status: OfferStatus.LOST, count: result[2] },
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

      const result = await Promise.all([opened, won, lost]);

      return [
        { status: ProspectionStatus.OPENED, count: result[0] },
        { status: ProspectionStatus.WON, count: result[1]},
        { status: ProspectionStatus.LOST, count: result[2]},
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

      const paidAmount = this.prismaClientService.invoice.aggregate({
        where: { project: { tenantId }, status: 'PAID' },
        _sum: { amount: true }
      });

      const unpaidAmount = this.prismaClientService.invoice.aggregate({
        where: { project: { tenantId }, status: 'UNPAID' },
        _sum: { amount: true }
      });

      const unpdaid = this.prismaClientService.invoice.count({
        where: { project: { tenantId }, status: 'UNPAID' }
      });

      const result = await Promise.all([paid, unpdaid, paidAmount, unpaidAmount]);

      return [
        { status: InvoiceStatus.PAID, count: result[0], sum: result[2]._sum.amount },
        { status: InvoiceStatus.UNPAID, count: result[1], sum: result[3]._sum.amount },
      ];
    }
    catch(err) {
      this.logger.error("Error while fetching the invoice overview: ", err);
      throw new InternalServerErrorException("Error while fetching the invoice overview.");
    }
  }
}
