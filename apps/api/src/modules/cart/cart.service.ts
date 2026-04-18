import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                distributor: {
                  select: { id: true, name: true },
                },
                stocks: {
                  select: { availableQty: true },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  distributor: {
                    select: { id: true, name: true },
                  },
                  stocks: {
                    select: { availableQty: true },
                  },
                },
              },
            },
          },
        },
      });
    }

    const items = cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      product: {
        id: item.product.id,
        sku: item.product.sku,
        name: item.product.name,
        brand: item.product.brand,
        imageUrl: item.product.imageUrl,
        distributor: item.product.distributor,
        stock: item.product.stocks.reduce((sum, s) => sum + s.availableQty, 0),
      },
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: Number(item.unitPrice) * item.quantity,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = subtotal * 0.21;
    const totalAmount = subtotal + taxAmount;

    return {
      id: cart.id,
      items,
      itemCount: items.length,
      subtotal,
      taxAmount,
      totalAmount,
    };
  }

  async addItem(userId: string, addCartItemDto: AddCartItemDto) {
    const { productId, quantity } = addCartItemDto;

    // Get or create cart
    let cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId } });
    }

    // Get product with price
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        prices: {
          take: 1,
        },
        stocks: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.isActive) {
      throw new BadRequestException('Product is not available');
    }

    const unitPrice = product.prices[0]?.finalPrice || 0;

    // Check if item already in cart
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          unitPrice,
        },
      });
    }

    return this.getCart(userId);
  }

  async updateItem(userId: string, itemId: string, updateCartItemDto: UpdateCartItemDto) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    if (updateCartItemDto.quantity <= 0) {
      await this.prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await this.prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity: updateCartItemDto.quantity },
      });
    }

    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({ where: { id: itemId } });

    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      return { success: true };
    }

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return { success: true };
  }
}
