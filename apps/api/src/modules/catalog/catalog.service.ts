import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ProductQueryDto, userOrganizationId: string) {
    const {
      page = 1,
      limit = 20,
      search,
      brand,
      category,
      distributorId,
      inStock,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (brand) {
      where.brand = { equals: brand, mode: 'insensitive' };
    }

    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (distributorId) {
      where.distributorId = distributorId;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          distributor: {
            select: {
              id: true,
              name: true,
            },
          },
          stocks: {
            where: {
              availableQty: inStock ? { gt: 0 } : undefined,
            },
            select: {
              availableQty: true,
              organizationId: true,
            },
          },
          prices: {
            where: {
              organizationId: userOrganizationId,
            },
            select: {
              basePrice: true,
              finalPrice: true,
              discountPercent: true,
            },
            take: 1,
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    // Transform products to include price and stock info
    const transformedProducts = products.map((product) => ({
      id: product.id,
      sku: product.sku,
      ean: product.ean,
      name: product.name,
      description: product.description,
      brand: product.brand,
      category: product.category,
      subcategory: product.subcategory,
      imageUrl: product.imageUrl,
      unit: product.unit,
      minOrderQty: product.minOrderQty,
      distributor: product.distributor,
      price: product.prices[0] || null,
      stock: product.stocks.reduce((sum, s) => sum + s.availableQty, 0),
    }));

    return {
      data: transformedProducts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, userOrganizationId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        distributor: {
          select: {
            id: true,
            name: true,
          },
        },
        stocks: {
          select: {
            availableQty: true,
            organizationId: true,
          },
        },
        prices: {
          where: {
            organizationId: userOrganizationId,
          },
          take: 1,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      ...product,
      price: product.prices[0] || null,
      stock: product.stocks.reduce((sum, s) => sum + s.availableQty, 0),
    };
  }

  async create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: createProductDto,
      include: {
        distributor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        distributor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getCategories() {
    const categories = await this.prisma.product.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: { category: true },
    });

    return categories.map((c) => ({
      name: c.category,
      count: c._count.category,
    }));
  }

  async getBrands() {
    const brands = await this.prisma.product.groupBy({
      by: ['brand'],
      where: { isActive: true },
      _count: { brand: true },
    });

    return brands.map((b) => ({
      name: b.brand,
      count: b._count.brand,
    }));
  }
}
