# Cosmetic Pipeline

Plataforma B2B para gestión de pedidos de cosmética entre distribuidoras y tiendas.

**Proyecto universitario** - Implementación completa del flujo B2B de gestión de pedidos.

---

> **Contexto importante**: Este es un proyecto de universidad completamente implementado. Tanto el backend como el frontend están operativos al 100%.

### Estado actual (Junio 2026)

**FUNCIONANDO — TODO IMPLEMENTADO:**
- Login/Logout con JWT
- Catálogo de productos (42 productos de demo)
- Carrito de compras (añadir, modificar, eliminar)
- Crear pedidos desde el carrito
- Lista de pedidos del usuario
- Detalle de pedido con historial de estados e incidencias
- Página de incidencias del portal (ver y crear)
- Perfil de usuario
- Dashboard de admin con KPIs
- Gestión de pedidos con cambio de estado (backoffice)
- Gestión de catálogo con upload de imágenes (backoffice)
- Gestión de usuarios CRUD (backoffice)
- Gestión de organizaciones (backoffice)
- Gestión de incidencias (backoffice)
- Importar/Exportar CSV (backoffice)
- Reportes y analytics (backoffice)

### Cómo arrancar el proyecto

```powershell
# 1. Iniciar Docker Desktop en Windows

# 2. Levantar PostgreSQL
cd "C:\Users\gamen\OneDrive\Escritorio\Cosmetic Pipeline\cosmetic-pipeline"
docker-compose -f docker-compose.dev.yml up -d

# 3. Generar Prisma y seed (si es necesario)
cd apps\api
npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts

# 4. Iniciar Backend (Terminal 1)
cd apps\api
npm run dev

# 5. Iniciar Frontend (Terminal 2)
cd apps\web
npm run dev
```

**URLs:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Swagger: http://localhost:3001/api/docs

### Si hay errores comunes

1. **"bcrypt is not a valid Win32 application"**: Borrar node_modules y reinstalar desde Windows
   ```powershell
   Remove-Item -Recurse -Force node_modules
   npm install
   ```

2. **"Module @prisma/client has no exported member"**: Regenerar Prisma
   ```powershell
   cd apps\api
   npx prisma generate
   ```

3. **Base de datos no conecta**: Verificar que Docker Desktop esté corriendo

---

## Stack Tecnológico

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | Next.js 14, React 18, TypeScript 5.4, Tailwind CSS 3.4, Radix UI |
| **Backend** | NestJS 10, TypeScript 5.4, Prisma ORM 5.10 |
| **Base de datos** | PostgreSQL 16 |
| **Autenticación** | JWT + Refresh Tokens + RBAC (4 roles) |
| **Infraestructura** | Docker, Turborepo (monorepo) |

---

## Requisitos del Sistema

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **Docker Desktop** (para PostgreSQL)
- **Windows 10/11** (desarrollado en Windows con WSL2)

---

## Instalación Completa

### 1. Configurar variables de entorno

El archivo `.env` ya está configurado en `apps/api/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cosmetic_pipeline?schema=public"
JWT_SECRET="cosmetic-pipeline-jwt-secret-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="cosmetic-pipeline-refresh-secret-change-in-production"
JWT_REFRESH_EXPIRES_IN="7d"
API_PORT=3001
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

El archivo `.env.local` en `apps/web`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 2. Instalar dependencias

```powershell
cd "C:\Users\gamen\OneDrive\Escritorio\Cosmetic Pipeline\cosmetic-pipeline"
npm install
```

### 3. Levantar base de datos

```powershell
docker-compose -f docker-compose.dev.yml up -d
```

Esto levanta:
- **PostgreSQL** en puerto 5432
- **Mailhog** en puerto 8025 (para ver emails de prueba)

### 4. Configurar base de datos

```powershell
cd apps\api
npx prisma generate    # Genera el cliente
npx prisma db push     # Crea las tablas
npx ts-node prisma/seed.ts  # Carga datos demo
```

### 5. Iniciar aplicación

**Terminal 1 - Backend:**
```powershell
cd "C:\Users\gamen\OneDrive\Escritorio\Cosmetic Pipeline\cosmetic-pipeline\apps\api"
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd "C:\Users\gamen\OneDrive\Escritorio\Cosmetic Pipeline\cosmetic-pipeline\apps\web"
npm run dev
```

---

## Usuarios de Prueba

| Email | Password | Rol | Acceso |
|-------|----------|-----|--------|
| `admin@cosmetic-pipeline.com` | `Admin123!` | ADMIN | Backoffice completo |
| `operaciones@cosmeticpro.es` | `Admin123!` | OPERATIONS | Gestión operativa |
| `tienda1@beautystore.es` | `Admin123!` | STORE | Portal de compras |
| `tienda2@farmaciacentral.es` | `Admin123!` | STORE | Portal de compras |

---

## Estructura del Proyecto

```
cosmetic-pipeline/
├── apps/
│   ├── api/                      # Backend NestJS (Puerto 3001)
│   │   ├── prisma/
│   │   │   ├── schema.prisma     # Esquema de BD (16 entidades)
│   │   │   └── seed.ts           # Datos de prueba
│   │   ├── src/
│   │   │   ├── common/           # Guards, decoradores
│   │   │   │   ├── decorators/
│   │   │   │   │   ├── current-user.decorator.ts
│   │   │   │   │   └── roles.decorator.ts
│   │   │   │   └── guards/
│   │   │   │       ├── jwt-auth.guard.ts
│   │   │   │       └── roles.guard.ts
│   │   │   ├── modules/
│   │   │   │   ├── auth/         # Login, JWT, refresh
│   │   │   │   ├── users/        # CRUD usuarios
│   │   │   │   ├── organizations/# Distribuidoras y tiendas
│   │   │   │   ├── catalog/      # Productos, precios, stock
│   │   │   │   ├── cart/         # Carrito de compras
│   │   │   │   ├── orders/       # Pedidos y estados
│   │   │   │   ├── incidents/    # Incidencias
│   │   │   │   ├── integrations/ # CSV import/export
│   │   │   │   ├── notifications/# Emails
│   │   │   │   └── reporting/    # Dashboard, KPIs
│   │   │   ├── prisma/
│   │   │   │   └── prisma.service.ts
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   └── package.json
│   │
│   └── web/                      # Frontend Next.js (Puerto 3000)
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/
│       │   │   │   ├── login/
│       │   │   │   │   └── page.tsx    # Página de login
│       │   │   │   └── layout.tsx
│       │   │   ├── (portal)/           # Sección tienda (STORE)
│       │   │   │   ├── catalog/
│       │   │   │   │   └── page.tsx    # Catálogo productos
│       │   │   │   ├── cart/
│       │   │   │   │   └── page.tsx    # Carrito
│       │   │   │   ├── orders/
│       │   │   │   │   └── page.tsx    # Lista pedidos
│       │   │   │   └── layout.tsx      # Layout con navegación
│       │   │   ├── (backoffice)/       # Sección admin
│       │   │   │   ├── dashboard/
│       │   │   │   │   └── page.tsx    # Dashboard KPIs
│       │   │   │   └── layout.tsx      # Layout admin
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx            # Redirect a login
│       │   │   └── providers.tsx       # React Query
│       │   ├── components/
│       │   │   └── ui/                 # Componentes Radix UI
│       │   ├── hooks/
│       │   │   ├── use-auth.ts         # Estado autenticación (Zustand)
│       │   │   └── use-toast.ts        # Notificaciones
│       │   ├── lib/
│       │   │   ├── api-client.ts       # Cliente HTTP
│       │   │   └── utils.ts
│       │   └── types/
│       │       └── index.ts            # Tipos TypeScript
│       └── package.json
│
├── docker-compose.dev.yml        # PostgreSQL + Mailhog
├── docker-compose.yml            # Producción
├── turbo.json                    # Configuración monorepo
├── package.json                  # Workspace root
└── README.md                     # Este archivo
```

---

## Base de Datos - Esquema

### Entidades principales (16 tablas)

```
┌─────────────────┐     ┌─────────────────┐
│  Organization   │────<│      User       │
│  (Distributor/  │     │  (4 roles)      │
│   Store)        │     └────────┬────────┘
└────────┬────────┘              │
         │                       │
         │     ┌─────────────────┼─────────────────┐
         │     │                 │                 │
         ▼     ▼                 ▼                 ▼
┌─────────────────┐     ┌─────────────────┐  ┌──────────┐
│    Product      │────<│     Order       │  │   Cart   │
│  (42 productos) │     │  (8 estados)    │  │          │
└────────┬────────┘     └────────┬────────┘  └────┬─────┘
         │                       │                │
         ▼                       ▼                ▼
┌─────────────────┐     ┌─────────────────┐  ┌──────────┐
│  ProductPrice   │     │   OrderItem     │  │ CartItem │
│     Stock       │     │  StatusHistory  │  │          │
└─────────────────┘     │    Incident     │  └──────────┘
                        └─────────────────┘
```

### Enums

```typescript
OrganizationType: DISTRIBUTOR | STORE
UserRole: ADMIN | OPERATIONS | DISTRIBUTOR | STORE
OrderStatus: DRAFT | SUBMITTED | CONFIRMED | PREPARING | SHIPPED | DELIVERED | CANCELLED | INCIDENT_REPORTED
IncidentType: DAMAGED | WRONG_ITEM | MISSING_ITEM | QUALITY_ISSUE | DELIVERY_ISSUE | OTHER
IncidentStatus: OPEN | IN_PROGRESS | RESOLVED | CLOSED
```

---

## API Endpoints Completos

### Auth `/api/auth`
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/login` | Login con email/password | No |
| POST | `/refresh` | Renovar access token | No |
| POST | `/logout` | Cerrar sesión | JWT |
| GET | `/me` | Usuario actual | JWT |

### Users `/api/users`
| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/` | Listar usuarios | ADMIN, OPERATIONS |
| GET | `/:id` | Detalle usuario | ADMIN, OPERATIONS |
| POST | `/` | Crear usuario | ADMIN |
| PATCH | `/:id` | Actualizar usuario | ADMIN |
| DELETE | `/:id` | Desactivar usuario | ADMIN |

### Organizations `/api/organizations`
| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/` | Listar organizaciones | ADMIN, OPERATIONS |
| GET | `/distributors` | Listar distribuidoras | Público |
| GET | `/stores` | Listar tiendas | ADMIN, OPERATIONS, DISTRIBUTOR |
| GET | `/:id` | Detalle organización | ADMIN, OPERATIONS |
| POST | `/` | Crear organización | ADMIN |
| PATCH | `/:id` | Actualizar | ADMIN |
| DELETE | `/:id` | Desactivar | ADMIN |

### Catalog `/api/products`
| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/` | Listar productos | JWT requerido |
| GET | `/categories` | Listar categorías | JWT requerido |
| GET | `/brands` | Listar marcas | JWT requerido |
| GET | `/:id` | Detalle producto | JWT requerido |
| POST | `/` | Crear producto | ADMIN, OPERATIONS |
| PATCH | `/:id` | Actualizar producto | ADMIN, OPERATIONS |

**Query params para GET /products:**
- `page` - Página (default: 1)
- `limit` - Items por página (default: 12)
- `search` - Búsqueda por nombre
- `brand` - Filtrar por marca
- `category` - Filtrar por categoría
- `distributorId` - Filtrar por distribuidor
- `inStock` - Solo con stock (true/false)

### Cart `/api/cart`
| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/` | Mi carrito | JWT requerido |
| POST | `/items` | Añadir producto | JWT requerido |
| PATCH | `/items/:id` | Modificar cantidad | JWT requerido |
| DELETE | `/items/:id` | Eliminar item | JWT requerido |
| DELETE | `/` | Vaciar carrito | JWT requerido |

### Orders `/api/orders`
| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/` | Listar pedidos | JWT requerido |
| GET | `/:id` | Detalle pedido | JWT requerido |
| GET | `/:id/history` | Historial estados | JWT requerido |
| POST | `/` | Crear pedido | STORE |
| PATCH | `/:id/status` | Cambiar estado | ADMIN, OPERATIONS, DISTRIBUTOR |

**Estados del pedido:**
```
DRAFT → SUBMITTED → CONFIRMED → PREPARING → SHIPPED → DELIVERED
                 ↘ CANCELLED
                 ↘ INCIDENT_REPORTED
```

### Incidents `/api/incidents`
| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/` | Listar incidencias | JWT requerido |
| GET | `/:id` | Detalle incidencia | JWT requerido |
| POST | `/` | Crear incidencia | STORE, OPERATIONS |
| PATCH | `/:id` | Actualizar | ADMIN, OPERATIONS |

### Integrations `/api/integrations`
| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| POST | `/catalog/import` | Importar productos CSV | ADMIN |
| POST | `/stock/import` | Importar stock CSV | ADMIN |
| GET | `/orders/export` | Exportar pedidos CSV | ADMIN, OPERATIONS |
| GET | `/jobs` | Listar jobs | ADMIN |
| GET | `/jobs/:id` | Detalle job | ADMIN |

### Reporting `/api/reports`
| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/dashboard` | KPIs dashboard | ADMIN, OPERATIONS |
| GET | `/orders` | Métricas pedidos | ADMIN, OPERATIONS |
| GET | `/incidents` | Métricas incidencias | ADMIN, OPERATIONS |

---

## Estado de Implementación

### Frontend - Portal (Tienda)

| Página | Ruta | Estado | Notas |
|--------|------|--------|-------|
| Login | `/login` | ✅ Completo | Form con validación |
| Catálogo | `/catalog` | ✅ Completo | Grid, búsqueda, añadir carrito |
| Carrito | `/cart` | ✅ Completo | Modificar, eliminar, checkout |
| Lista pedidos | `/orders` | ✅ Completo | Lista con estados |
| Detalle pedido | `/orders/[id]` | ✅ Completo | Productos, totales, historial, incidencias |
| Incidencias | `/incidents` | ✅ Completo | Ver y crear incidencias |
| Perfil | `/profile` | ✅ Completo | Datos del usuario |

### Frontend - Backoffice (Admin)

| Página | Ruta | Estado | Notas |
|--------|------|--------|-------|
| Dashboard | `/admin/dashboard` | ✅ Completo | KPIs, gráficos |
| Gestión pedidos | `/admin/orders` | ✅ Completo | Tabla, filtros, cambio de estado |
| Gestión catálogo | `/admin/products` | ✅ Completo | CRUD + upload de imagen |
| Gestión usuarios | `/admin/users` | ✅ Completo | CRUD completo |
| Gestión organizaciones | `/admin/organizations` | ✅ Completo | CRUD completo |
| Gestión incidencias | `/admin/incidents` | ✅ Completo | Tabla, filtros, resolución |
| Integraciones | `/admin/integrations` | ✅ Completo | CSV import/export |
| Reportes | `/admin/reports` | ✅ Completo | Stats, productos top, gráfico ingresos |

### Backend API

| Módulo | Estado | Endpoints |
|--------|--------|-----------|
| Auth | ✅ Completo | 4 endpoints |
| Users | ✅ Completo | 5 endpoints |
| Organizations | ✅ Completo | 7 endpoints |
| Catalog | ✅ Completo | 6 endpoints |
| Cart | ✅ Completo | 5 endpoints |
| Orders | ✅ Completo | 5 endpoints |
| Incidents | ✅ Completo | 4 endpoints |
| Integrations | ✅ Completo | 5 endpoints |
| Reporting | ✅ Completo | 3 endpoints |

---

## Proyecto completamente implementado

Todas las funcionalidades están desarrolladas y operativas. No quedan tareas pendientes.

---

## Comandos Útiles

```powershell
# Desarrollo
npm run dev                    # Iniciar todo (desde raíz con turbo)

# Base de datos
cd apps/api
npx prisma generate           # Regenerar cliente
npx prisma db push            # Aplicar cambios schema
npx prisma studio             # UI para ver/editar datos
npx ts-node prisma/seed.ts    # Recargar datos demo

# Docker
docker-compose -f docker-compose.dev.yml up -d    # Iniciar BD
docker-compose -f docker-compose.dev.yml down     # Parar BD
docker-compose -f docker-compose.dev.yml logs -f  # Ver logs

# Build
npm run build                 # Build producción
npm run lint                  # Linter
```

---

## Troubleshooting

### Error: "bcrypt is not a valid Win32 application"
```powershell
cd "C:\Users\gamen\OneDrive\Escritorio\Cosmetic Pipeline\cosmetic-pipeline"
Remove-Item -Recurse -Force node_modules
npm install
```

### Error: "Module @prisma/client has no exported member"
```powershell
cd apps\api
npx prisma generate
```

### Error: "ECONNREFUSED localhost:5432"
Docker Desktop no está corriendo. Iniciarlo y ejecutar:
```powershell
docker-compose -f docker-compose.dev.yml up -d
```

### Error: "npm no se reconoce como comando"
Node.js no está instalado en Windows. Descargar de https://nodejs.org

### El frontend no conecta con el backend
Verificar que el backend esté corriendo en puerto 3001 y que exista `apps/web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## Datos de Demo

El seed crea:

**Organizaciones (2):**
- CosmeticPro Distribuciones (DISTRIBUTOR)
- Beauty Store Madrid (STORE)

**Usuarios (4):**
- 1 Admin, 1 Operations, 2 Store

**Productos (42):**
- Categorías: Cuidado Facial, Maquillaje, Cuidado Corporal, Cabello, Fragancias
- Marcas: L'Oréal, Estée Lauder, Clinique, MAC, Lancôme, etc.
- Cada producto tiene precio y stock asignado

**Pedidos de ejemplo:**
- Varios pedidos en diferentes estados para pruebas

---

## Arquitectura

### Autenticación
```
Cliente → Login → JWT Access Token (15min) + Refresh Token (7d)
       → Guarda tokens en localStorage (Zustand persist)
       → Cada request incluye Bearer token
       → Si 401, intenta refresh automático
```

### Flujo de Pedido
```
1. Usuario STORE navega catálogo
2. Añade productos al carrito (Cart + CartItem)
3. Hace checkout → se crea Order con estado SUBMITTED
4. Admin/Operations confirma → CONFIRMED
5. Distribuidor prepara → PREPARING
6. Se envía → SHIPPED
7. Se entrega → DELIVERED
```

### RBAC (Control de Acceso)
```
ADMIN       → Todo
OPERATIONS  → Gestión operativa (no usuarios)
DISTRIBUTOR → Sus productos y pedidos recibidos
STORE       → Comprar y ver sus pedidos
```

---

## Contacto

Proyecto desarrollado para asignatura universitaria.

Ruta del proyecto: `C:\Users\gamen\OneDrive\Escritorio\Cosmetic Pipeline\cosmetic-pipeline`
