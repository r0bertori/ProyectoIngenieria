# Estado del Proyecto Cosmetic Pipeline

## Completado

- [x] Estructura monorepo con Turborepo
- [x] Backend NestJS completo (auth, users, organizations, catalog, cart, orders, incidents, integrations, notifications, reporting)
- [x] Schema Prisma con 16 entidades
- [x] Seed de datos demo (42 productos, 4 usuarios, pedidos de ejemplo)
- [x] Docker Compose configurado (PostgreSQL + Mailhog)
- [x] Dependencias npm instaladas
- [x] Archivos .env creados

### Frontend Portal (Tienda)
- [x] Login / Logout con JWT
- [x] Catálogo de productos con búsqueda y paginación
- [x] Carrito de compras (añadir, modificar, eliminar, checkout)
- [x] Lista de pedidos
- [x] Detalle de pedido con historial de estados e incidencias
- [x] Página de incidencias (ver y crear)
- [x] Perfil de usuario

### Frontend Backoffice (Admin / Operations)
- [x] Dashboard con KPIs del mes
- [x] Gestión de pedidos con cambio de estado
- [x] Gestión de catálogo con upload de imágenes
- [x] Gestión de usuarios (CRUD)
- [x] Gestión de organizaciones (CRUD)
- [x] Gestión de incidencias
- [x] Integraciones CSV (import/export)
- [x] Reportes y analytics

## Comandos para arrancar

```bash
# 1. Levantar PostgreSQL con Docker
docker compose -f docker-compose.dev.yml up -d

# 2. Configurar Prisma (solo la primera vez)
cd apps/api
npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts

# 3. Iniciar el proyecto completo
cd ../..
npm run dev
```

## URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Swagger Docs: http://localhost:3001/api/docs

## Usuarios demo

| Email | Password | Rol |
|-------|----------|-----|
| admin@cosmetic-pipeline.com | Admin123! | ADMIN (backoffice) |
| operaciones@cosmeticpro.es | Admin123! | OPERATIONS |
| tienda1@beautystore.es | Admin123! | STORE (portal B2B) |
| tienda2@farmaciacentral.es | Admin123! | STORE |
