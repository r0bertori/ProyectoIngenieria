import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { OrderStatus, UserRole, Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  // Valid status transitions
  private statusTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.DRAFT]: [OrderStatus.SUBMITTED, OrderStatus.CANCELLED],
    [OrderStatus.SUBMITTED]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
    [OrderStatus.PREPARING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.INCIDENT_REPORTED],
    [OrderStatus.DELIVERED]: [OrderStatus.INCIDENT_REPORTED],
    [OrderStatus.CANCELLED]: [],
    [OrderStatus.INCIDENT_REPORTED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  };

  async findAll(query: OrderQueryDto, userId: string, userRole: UserRole, organizationId: string) {
    const { page = 1, limit = 20, status, fromDate, toDate, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    // Filter by role
    if (userRole === UserRole.STORE) {
      where.storeId = organizationId;
    } else if (userRole === UserRole.DISTRIBUTOR) {
      where.distributorId = organizationId;
    }

    if (status) {
      where.status = status;
    }

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { store: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          store: { select: { id: true, name: true } },
          distributor: { select: { id: true, name: true } },
          _count: { select: { items: true, incidents: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, userId: string, userRole: UserRole, organizationId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        store: true,
        distributor: true,
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        items: {
          include: {
            product: { select: { id: true, imageUrl: true } },
          },
        },
        statusHistory: { orderBy: { createdAt: 'desc' } },
        incidents: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check access
    if (
      userRole === UserRole.STORE &&
      order.storeId !== organizationId
    ) {
      throw new ForbiddenException('Access denied');
    }

    return order;
  }

  async createFromCart(userId: string, organizationId: string, createOrderDto: CreateOrderDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                distributor: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Get store info
    const store = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Group items by distributor (for this MVP, assume single distributor)
    const distributorId = cart.items[0].product.distributorId;

    // Calculate totals
    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity,
      0,
    );
    const taxPercent = 21;
    const taxAmount = subtotal * (taxPercent / 100);
    const totalAmount = subtotal + taxAmount;

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Create order in transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          storeId: organizationId,
          distributorId,
          userId,
          status: OrderStatus.SUBMITTED,
          shippingAddress: createOrderDto.shippingAddress || store.address,
          shippingCity: createOrderDto.shippingCity || store.city,
          shippingPostalCode: createOrderDto.shippingPostalCode || store.postalCode,
          subtotal,
          taxPercent,
          taxAmount,
          totalAmount,
          notes: createOrderDto.notes,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              sku: item.product.sku,
              name: item.product.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: Number(item.unitPrice) * item.quantity,
            })),
          },
          statusHistory: {
            create: {
              toStatus: OrderStatus.SUBMITTED,
              changedBy: userId,
              comment: 'Order created',
            },
          },
        },
        include: {
          store: true,
          distributor: true,
          items: true,
        },
      });

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    // Send notification
    await this.notifications.sendOrderCreatedEmail(order);

    return order;
  }

  async updateStatus(
    id: string,
    userId: string,
    updateStatusDto: UpdateOrderStatusDto,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { store: true, user: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const { status, comment, trackingNumber, estimatedDelivery } = updateStatusDto;

    // Validate transition
    const validTransitions = this.statusTransitions[order.status];
    if (!validTransitions.includes(status)) {
      throw new BadRequestException(
        `Invalid status transition from ${order.status} to ${status}`,
      );
    }

    const data: Prisma.OrderUpdateInput = {
      status,
      statusHistory: {
        create: {
          fromStatus: order.status,
          toStatus: status,
          changedBy: userId,
          comment,
        },
      },
    };

    if (trackingNumber) data.trackingNumber = trackingNumber;
    if (estimatedDelivery) data.estimatedDelivery = new Date(estimatedDelivery);
    if (status === OrderStatus.DELIVERED) data.deliveredAt = new Date();

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data,
      include: {
        store: true,
        distributor: true,
        items: true,
        statusHistory: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    // Send notification
    await this.notifications.sendOrderStatusChangedEmail(updatedOrder);

    return updatedOrder;
  }

  async getStatusHistory(id: string) {
    return this.prisma.orderStatusHistory.findMany({
      where: { orderId: id },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `PED-${year}-`;

    const lastOrder = await this.prisma.order.findFirst({
      where: {
        orderNumber: { startsWith: prefix },
      },
      orderBy: { orderNumber: 'desc' },
    });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.split('-').pop() || '0', 10);
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(5, '0')}`;
  }
}
