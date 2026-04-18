import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('cleanDatabase is not allowed in production');
    }

    // Delete in order to respect foreign keys
    await this.auditLog.deleteMany();
    await this.notificationLog.deleteMany();
    await this.integrationJob.deleteMany();
    await this.incident.deleteMany();
    await this.orderStatusHistory.deleteMany();
    await this.orderItem.deleteMany();
    await this.order.deleteMany();
    await this.cartItem.deleteMany();
    await this.cart.deleteMany();
    await this.productPrice.deleteMany();
    await this.stock.deleteMany();
    await this.product.deleteMany();
    await this.refreshToken.deleteMany();
    await this.user.deleteMany();
    await this.organization.deleteMany();
  }
}
