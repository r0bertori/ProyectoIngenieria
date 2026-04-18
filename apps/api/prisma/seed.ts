import { PrismaClient, OrganizationType, UserRole, OrderStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean database
  await prisma.auditLog.deleteMany();
  await prisma.notificationLog.deleteMany();
  await prisma.integrationJob.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productPrice.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.product.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  console.log('✅ Database cleaned');

  // Create organizations
  const distributor = await prisma.organization.create({
    data: {
      name: 'CosmeticPro Distribución S.L.',
      type: OrganizationType.DISTRIBUTOR,
      taxId: 'B12345678',
      email: 'info@cosmeticpro.es',
      phone: '+34 912 345 678',
      address: 'Calle Industrial, 45',
      city: 'Madrid',
      postalCode: '28045',
    },
  });

  const store1 = await prisma.organization.create({
    data: {
      name: 'Beauty Store Madrid',
      type: OrganizationType.STORE,
      taxId: 'B87654321',
      email: 'contacto@beautystore.es',
      phone: '+34 915 555 111',
      address: 'Calle Gran Vía, 123',
      city: 'Madrid',
      postalCode: '28013',
    },
  });

  const store2 = await prisma.organization.create({
    data: {
      name: 'Farmacia Central',
      type: OrganizationType.STORE,
      taxId: 'B11223344',
      email: 'pedidos@farmaciacentral.es',
      phone: '+34 916 666 222',
      address: 'Avenida de la Constitución, 50',
      city: 'Madrid',
      postalCode: '28028',
    },
  });

  const store3 = await prisma.organization.create({
    data: {
      name: 'Perfumería Elegance',
      type: OrganizationType.STORE,
      taxId: 'B55667788',
      email: 'compras@elegance.es',
      phone: '+34 917 777 333',
      address: 'Calle Serrano, 80',
      city: 'Madrid',
      postalCode: '28006',
    },
  });

  console.log('✅ Organizations created');

  // Create users (password: Admin123!)
  const passwordHash = await bcrypt.hash('Admin123!', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@cosmetic-pipeline.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'Sistema',
      role: UserRole.ADMIN,
      organizationId: distributor.id,
    },
  });

  const operations = await prisma.user.create({
    data: {
      email: 'operaciones@cosmeticpro.es',
      passwordHash,
      firstName: 'María',
      lastName: 'García',
      role: UserRole.OPERATIONS,
      organizationId: distributor.id,
    },
  });

  const storeUser1 = await prisma.user.create({
    data: {
      email: 'tienda1@beautystore.es',
      passwordHash,
      firstName: 'Carlos',
      lastName: 'López',
      role: UserRole.STORE,
      organizationId: store1.id,
    },
  });

  const storeUser2 = await prisma.user.create({
    data: {
      email: 'tienda2@farmaciacentral.es',
      passwordHash,
      firstName: 'Ana',
      lastName: 'Martínez',
      role: UserRole.STORE,
      organizationId: store2.id,
    },
  });

  console.log('✅ Users created');

  // Create products
  const categories = [
    { name: 'Cuidado Facial', subcategories: ['Hidratantes', 'Serums', 'Limpiadores', 'Mascarillas'] },
    { name: 'Maquillaje', subcategories: ['Rostro', 'Ojos', 'Labios', 'Uñas'] },
    { name: 'Cuidado Corporal', subcategories: ['Hidratantes', 'Exfoliantes', 'Aceites'] },
    { name: 'Capilar', subcategories: ['Champús', 'Acondicionadores', 'Tratamientos'] },
  ];

  const brands = ["L'Oreal", 'Nivea', 'Garnier', 'Neutrogena', 'Vichy', 'La Roche-Posay', 'Clinique', 'Estée Lauder'];

  const products: any[] = [];
  let skuCounter = 1;

  for (const category of categories) {
    for (const subcategory of category.subcategories) {
      for (let i = 0; i < 3; i++) {
        const brand = brands[Math.floor(Math.random() * brands.length)];
        const sku = `SKU-${String(skuCounter++).padStart(4, '0')}`;
        const basePrice = Math.floor(Math.random() * 50) + 10;

        const product = await prisma.product.create({
          data: {
            sku,
            ean: `84${String(Math.floor(Math.random() * 10000000000)).padStart(11, '0')}`,
            name: `${brand} ${subcategory} ${i + 1}`,
            description: `Producto de alta calidad de ${brand} para ${category.name.toLowerCase()}.`,
            brand,
            category: category.name,
            subcategory,
            imageUrl: `https://placehold.co/400x400/e2e8f0/475569?text=${encodeURIComponent(sku)}`,
            distributorId: distributor.id,
          },
        });

        // Create stock
        await prisma.stock.create({
          data: {
            productId: product.id,
            organizationId: distributor.id,
            quantity: Math.floor(Math.random() * 200) + 50,
            availableQty: Math.floor(Math.random() * 150) + 50,
          },
        });

        // Create prices for each store
        for (const store of [store1, store2, store3]) {
          const discount = Math.random() > 0.7 ? Math.floor(Math.random() * 15) + 5 : 0;
          const finalPrice = basePrice * (1 - discount / 100);

          await prisma.productPrice.create({
            data: {
              productId: product.id,
              organizationId: store.id,
              basePrice,
              discountPercent: discount,
              finalPrice: Math.round(finalPrice * 100) / 100,
            },
          });
        }

        products.push(product);
      }
    }
  }

  console.log(`✅ ${products.length} products created`);

  // Create sample orders
  const orderStatuses = [
    OrderStatus.DELIVERED,
    OrderStatus.DELIVERED,
    OrderStatus.DELIVERED,
    OrderStatus.SHIPPED,
    OrderStatus.PREPARING,
    OrderStatus.CONFIRMED,
    OrderStatus.SUBMITTED,
  ];

  for (let i = 0; i < 10; i++) {
    const store = [store1, store2, store3][i % 3];
    const user = i % 3 === 0 ? storeUser1 : storeUser2;
    const status = orderStatuses[i % orderStatuses.length];
    const orderProducts = products.slice(i * 3, i * 3 + 3);

    if (orderProducts.length === 0) continue;

    const items = orderProducts.map((p, idx) => ({
      productId: p.id,
      sku: p.sku,
      name: p.name,
      quantity: idx + 1,
      unitPrice: Math.floor(Math.random() * 30) + 15,
      totalPrice: 0,
    }));

    items.forEach((item) => {
      item.totalPrice = Number(item.unitPrice) * item.quantity;
    });

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = subtotal * 0.21;
    const totalAmount = subtotal + taxAmount;

    const order = await prisma.order.create({
      data: {
        orderNumber: `PED-2024-${String(i + 1).padStart(5, '0')}`,
        status,
        storeId: store.id,
        distributorId: distributor.id,
        userId: user.id,
        shippingAddress: store.address,
        shippingCity: store.city,
        shippingPostalCode: store.postalCode,
        subtotal,
        taxAmount,
        totalAmount,
        items: {
          create: items,
        },
        statusHistory: {
          create: {
            toStatus: status,
            changedBy: operations.id,
            comment: 'Created via seed',
          },
        },
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Add tracking for shipped orders
    if (status === OrderStatus.SHIPPED || status === OrderStatus.DELIVERED) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          trackingNumber: `TRACK-${String(Math.floor(Math.random() * 1000000)).padStart(8, '0')}`,
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
      });
    }

    if (status === OrderStatus.DELIVERED) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          deliveredAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  console.log('✅ Sample orders created');

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📧 Demo users (password: Admin123!):');
  console.log('   - admin@cosmetic-pipeline.com (ADMIN)');
  console.log('   - operaciones@cosmeticpro.es (OPERATIONS)');
  console.log('   - tienda1@beautystore.es (STORE)');
  console.log('   - tienda2@farmaciacentral.es (STORE)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
