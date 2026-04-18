# Estado del Proyecto Cosmetic Pipeline

## Completado

- [x] Estructura monorepo con Turborepo
- [x] Backend NestJS completo (auth, users, organizations, catalog, cart, orders, incidents, integrations, notifications, reporting)
- [x] Frontend Next.js (login, portal B2B, backoffice)
- [x] Schema Prisma con 16 entidades
- [x] Seed de datos demo
- [x] Docker Compose configurado
- [x] Dependencias npm instaladas
- [x] Archivos .env creados

## Pendiente (después de reiniciar)

1. **Levantar PostgreSQL con Docker**
2. **Generar cliente Prisma**
3. **Aplicar schema a la base de datos**
4. **Ejecutar seed de datos**
5. **Iniciar el proyecto**

## Comandos a ejecutar (en orden)

```bash
# 1. Ir a la carpeta del proyecto
cd C:\Users\gamen\Downloads\cosmetic-pipeline

# 2. Levantar PostgreSQL con Docker
docker compose -f docker-compose.dev.yml up -d

# 3. Configurar Prisma (en apps/api)
cd apps/api
npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts

# 4. Volver a la raíz e iniciar
cd ../..
npm run dev
```

## URLs una vez iniciado

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

## Nota para Claude

Cuando el usuario vuelva después de reiniciar:
1. Verificar que Docker está corriendo
2. Ejecutar los comandos de la sección "Comandos a ejecutar"
3. Abrir http://localhost:3000 en el navegador
