import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { IncidentQueryDto } from './dto/incident-query.dto';
import { IncidentStatus, UserRole, OrderStatus, Prisma } from '@prisma/client';

@Injectable()
export class IncidentsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async findAll(query: IncidentQueryDto, userRole: UserRole, organizationId: string) {
    const { page = 1, limit = 20, status, type } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.IncidentWhereInput = {};

    if (userRole === UserRole.STORE) {
      where.order = { storeId: organizationId };
    } else if (userRole === UserRole.DISTRIBUTOR) {
      where.order = { distributorId: organizationId };
    }

    if (status) where.status = status;
    if (type) where.type = type;

    const [incidents, total] = await Promise.all([
      this.prisma.incident.findMany({
        where,
        skip,
        take: limit,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              store: { select: { id: true, name: true } },
            },
          },
          reportedBy: {
            select: { id: true, firstName: true, lastName: true },
          },
          assignedTo: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.incident.count({ where }),
    ]);

    return {
      data: incidents,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const incident = await this.prisma.incident.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            store: true,
            distributor: true,
            items: true,
          },
        },
        reportedBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!incident) {
      throw new NotFoundException('Incident not found');
    }

    return incident;
  }

  async create(userId: string, createIncidentDto: CreateIncidentDto) {
    const { orderId, type, description } = createIncidentDto;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { store: true, distributor: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const incidentNumber = await this.generateIncidentNumber();

    const incident = await this.prisma.$transaction(async (tx) => {
      const newIncident = await tx.incident.create({
        data: {
          incidentNumber,
          orderId,
          type,
          description,
          reportedById: userId,
        },
        include: {
          order: {
            include: {
              store: true,
              distributor: true,
            },
          },
          reportedBy: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      });

      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.INCIDENT_REPORTED,
          statusHistory: {
            create: {
              fromStatus: order.status,
              toStatus: OrderStatus.INCIDENT_REPORTED,
              changedBy: userId,
              comment: `Incident reported: ${incidentNumber}`,
            },
          },
        },
      });

      return newIncident;
    });

    await this.notifications.sendIncidentCreatedEmail(incident);

    return incident;
  }

  async update(id: string, userId: string, updateIncidentDto: UpdateIncidentDto) {
    const incident = await this.findById(id);

    const data: Prisma.IncidentUpdateInput = {};

    if (updateIncidentDto.status) {
      data.status = updateIncidentDto.status;
      if (updateIncidentDto.status === IncidentStatus.RESOLVED) {
        data.resolvedAt = new Date();
      }
    }

    if (updateIncidentDto.resolution) {
      data.resolution = updateIncidentDto.resolution;
    }

    if (updateIncidentDto.assignedToId) {
      data.assignedTo = { connect: { id: updateIncidentDto.assignedToId } };
    }

    return this.prisma.incident.update({
      where: { id },
      data,
      include: {
        order: {
          select: { id: true, orderNumber: true },
        },
        reportedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  private async generateIncidentNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `INC-${year}-`;

    const lastIncident = await this.prisma.incident.findFirst({
      where: { incidentNumber: { startsWith: prefix } },
      orderBy: { incidentNumber: 'desc' },
    });

    let sequence = 1;
    if (lastIncident) {
      const lastSequence = parseInt(lastIncident.incidentNumber.split('-').pop() || '0', 10);
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(5, '0')}`;
  }
}
