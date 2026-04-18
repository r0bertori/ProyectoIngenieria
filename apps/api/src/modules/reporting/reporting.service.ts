import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatus, IncidentStatus, UserRole } from '@prisma/client';

@Injectable()
export class ReportingService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(userRole: UserRole, organizationId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const whereOrg = userRole === UserRole.STORE
      ? { storeId: organizationId }
      : userRole === UserRole.DISTRIBUTOR
      ? { distributorId: organizationId }
      : {};

    // Orders this month
    const ordersThisMonth = await this.prisma.order.count({
      where: {
        ...whereOrg,
        createdAt: { gte: startOfMonth },
      },
    });

    // Orders last month
    const ordersLastMonth = await this.prisma.order.count({
      where: {
        ...whereOrg,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    });

    // Orders by status
    const ordersByStatus = await this.prisma.order.groupBy({
      by: ['status'],
      where: whereOrg,
      _count: { status: true },
    });

    // Open incidents
    const openIncidents = await this.prisma.incident.count({
      where: {
        status: { in: [IncidentStatus.OPEN, IncidentStatus.IN_PROGRESS] },
        order: whereOrg,
      },
    });

    // Revenue this month
    const revenueThisMonth = await this.prisma.order.aggregate({
      where: {
        ...whereOrg,
        createdAt: { gte: startOfMonth },
        status: { notIn: [OrderStatus.CANCELLED, OrderStatus.DRAFT] },
      },
      _sum: { totalAmount: true },
    });

    // Revenue last month
    const revenueLastMonth = await this.prisma.order.aggregate({
      where: {
        ...whereOrg,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        status: { notIn: [OrderStatus.CANCELLED, OrderStatus.DRAFT] },
      },
      _sum: { totalAmount: true },
    });

    // Top customers (for distributors/admins)
    let topCustomers: any[] = [];
    if (userRole !== UserRole.STORE) {
      const groupResult = await this.prisma.order.groupBy({
        by: ['storeId'],
        where: {
          ...whereOrg,
          createdAt: { gte: startOfMonth },
        },
        _count: { storeId: true },
        _sum: { totalAmount: true },
        orderBy: { _sum: { totalAmount: 'desc' } },
      });
      topCustomers = groupResult.slice(0, 5);

      // Get store names
      const storeIds = topCustomers.map((c) => c.storeId);
      const stores = await this.prisma.organization.findMany({
        where: { id: { in: storeIds } },
        select: { id: true, name: true },
      });
      const storeMap = new Map(stores.map((s) => [s.id, s.name]));

      topCustomers = topCustomers.map((c) => ({
        storeId: c.storeId,
        storeName: storeMap.get(c.storeId) || 'Unknown',
        orderCount: c._count.storeId,
        totalAmount: c._sum.totalAmount,
      }));
    }

    // Recent orders
    const recentOrders = await this.prisma.order.findMany({
      where: whereOrg,
      include: {
        store: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      summary: {
        ordersThisMonth,
        ordersLastMonth,
        ordersChange: ordersLastMonth > 0
          ? ((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100
          : 0,
        revenueThisMonth: Number(revenueThisMonth._sum.totalAmount || 0),
        revenueLastMonth: Number(revenueLastMonth._sum.totalAmount || 0),
        revenueChange: revenueLastMonth._sum.totalAmount
          ? ((Number(revenueThisMonth._sum.totalAmount || 0) - Number(revenueLastMonth._sum.totalAmount)) /
              Number(revenueLastMonth._sum.totalAmount)) * 100
          : 0,
        openIncidents,
      },
      ordersByStatus: ordersByStatus.map((s) => ({
        status: s.status,
        count: s._count.status,
      })),
      topCustomers,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        storeName: o.store.name,
        status: o.status,
        totalAmount: o.totalAmount,
        createdAt: o.createdAt,
      })),
    };
  }

  async getOrderMetrics(fromDate?: string, toDate?: string) {
    const where: any = {};

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    const [total, byStatus, byStore] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
        _sum: { totalAmount: true },
      }),
      this.prisma.order.groupBy({
        by: ['storeId'],
        where,
        _count: { storeId: true },
        _sum: { totalAmount: true },
        orderBy: { _sum: { totalAmount: 'desc' } },
        take: 10,
      }),
    ]);

    return { total, byStatus, byStore };
  }

  async getIncidentMetrics() {
    const [byStatus, byType] = await Promise.all([
      this.prisma.incident.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      this.prisma.incident.groupBy({
        by: ['type'],
        _count: { type: true },
      }),
    ]);

    return { byStatus, byType };
  }
}
