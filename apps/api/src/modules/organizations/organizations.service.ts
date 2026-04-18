import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationType } from '@prisma/client';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(type?: OrganizationType) {
    return this.prisma.organization.findMany({
      where: type ? { type } : {},
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            orders: true,
            products: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async create(createOrganizationDto: CreateOrganizationDto) {
    const existingOrg = await this.prisma.organization.findUnique({
      where: { taxId: createOrganizationDto.taxId },
    });

    if (existingOrg) {
      throw new ConflictException('Organization with this Tax ID already exists');
    }

    return this.prisma.organization.create({
      data: createOrganizationDto,
    });
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto) {
    await this.findById(id);

    return this.prisma.organization.update({
      where: { id },
      data: updateOrganizationDto,
    });
  }

  async deactivate(id: string) {
    await this.findById(id);

    return this.prisma.organization.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getDistributors() {
    return this.prisma.organization.findMany({
      where: { type: OrganizationType.DISTRIBUTOR, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async getStores() {
    return this.prisma.organization.findMany({
      where: { type: OrganizationType.STORE, isActive: true },
      orderBy: { name: 'asc' },
    });
  }
}
