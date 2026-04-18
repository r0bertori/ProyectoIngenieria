import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IntegrationJobType, IntegrationJobStatus, Prisma } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

@Injectable()
export class IntegrationsService {
  constructor(private prisma: PrismaService) {}

  async importCatalog(fileContent: string, distributorId: string) {
    const job = await this.prisma.integrationJob.create({
      data: {
        type: IntegrationJobType.CATALOG_IMPORT,
        status: IntegrationJobStatus.RUNNING,
        startedAt: new Date(),
      },
    });

    try {
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      let processed = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const record of records) {
        try {
          await this.prisma.product.upsert({
            where: { sku: record.sku },
            create: {
              sku: record.sku,
              ean: record.ean || null,
              name: record.name,
              description: record.description || null,
              brand: record.brand,
              category: record.category,
              subcategory: record.subcategory || null,
              imageUrl: record.imageUrl || null,
              distributorId,
            },
            update: {
              name: record.name,
              description: record.description || null,
              brand: record.brand,
              category: record.category,
              subcategory: record.subcategory || null,
              imageUrl: record.imageUrl || null,
            },
          });
          processed++;
        } catch (error) {
          failed++;
          errors.push(`Row ${processed + failed}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      await this.prisma.integrationJob.update({
        where: { id: job.id },
        data: {
          status: IntegrationJobStatus.COMPLETED,
          recordsProcessed: processed,
          recordsFailed: failed,
          errorLog: errors.length > 0 ? errors.join('\n') : null,
          completedAt: new Date(),
        },
      });

      return { jobId: job.id, processed, failed };
    } catch (error) {
      await this.prisma.integrationJob.update({
        where: { id: job.id },
        data: {
          status: IntegrationJobStatus.FAILED,
          errorLog: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date(),
        },
      });
      throw new BadRequestException('Failed to process CSV file');
    }
  }

  async importStock(fileContent: string, distributorId: string) {
    const job = await this.prisma.integrationJob.create({
      data: {
        type: IntegrationJobType.STOCK_IMPORT,
        status: IntegrationJobStatus.RUNNING,
        startedAt: new Date(),
      },
    });

    try {
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      let processed = 0;
      let failed = 0;

      for (const record of records) {
        try {
          const product = await this.prisma.product.findUnique({
            where: { sku: record.sku },
          });

          if (!product) {
            failed++;
            continue;
          }

          const quantity = parseInt(record.quantity, 10) || 0;

          await this.prisma.stock.upsert({
            where: {
              productId_organizationId: {
                productId: product.id,
                organizationId: distributorId,
              },
            },
            create: {
              productId: product.id,
              organizationId: distributorId,
              quantity,
              availableQty: quantity,
            },
            update: {
              quantity,
              availableQty: quantity,
            },
          });
          processed++;
        } catch {
          failed++;
        }
      }

      await this.prisma.integrationJob.update({
        where: { id: job.id },
        data: {
          status: IntegrationJobStatus.COMPLETED,
          recordsProcessed: processed,
          recordsFailed: failed,
          completedAt: new Date(),
        },
      });

      return { jobId: job.id, processed, failed };
    } catch (error) {
      await this.prisma.integrationJob.update({
        where: { id: job.id },
        data: {
          status: IntegrationJobStatus.FAILED,
          errorLog: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date(),
        },
      });
      throw new BadRequestException('Failed to process stock CSV');
    }
  }

  async exportOrders(fromDate?: string, toDate?: string) {
    const where: Prisma.OrderWhereInput = {};

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        store: { select: { name: true, taxId: true } },
        items: { select: { sku: true, name: true, quantity: true, unitPrice: true, totalPrice: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const rows = orders.flatMap((order) =>
      order.items.map((item) => ({
        orderNumber: order.orderNumber,
        orderDate: order.createdAt.toISOString().split('T')[0],
        status: order.status,
        storeName: order.store.name,
        storeTaxId: order.store.taxId,
        sku: item.sku,
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.totalPrice,
        orderTotal: order.totalAmount,
      })),
    );

    const csv = stringify(rows, {
      header: true,
      columns: [
        'orderNumber',
        'orderDate',
        'status',
        'storeName',
        'storeTaxId',
        'sku',
        'productName',
        'quantity',
        'unitPrice',
        'lineTotal',
        'orderTotal',
      ],
    });

    // Log the export job
    await this.prisma.integrationJob.create({
      data: {
        type: IntegrationJobType.ORDER_EXPORT,
        status: IntegrationJobStatus.COMPLETED,
        recordsProcessed: rows.length,
        startedAt: new Date(),
        completedAt: new Date(),
      },
    });

    return csv;
  }

  async getJobs(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      this.prisma.integrationJob.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.integrationJob.count(),
    ]);

    return {
      data: jobs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getJob(id: string) {
    return this.prisma.integrationJob.findUnique({ where: { id } });
  }
}
