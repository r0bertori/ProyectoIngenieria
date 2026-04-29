# PROJECT BRIEFING - Cosmetic Pipeline
## Cuadro de Mandos del Proyecto

**Fecha del informe:** 15/04/2026
**Versión:** v3.1
**Equipo:** A. Rodas, M.A. Rodríguez, A. Medina, R. Ruiz
**Institución:** Universidad Europea de Madrid - Proyecto de Ingeniería

---

## 1. RESUMEN EJECUTIVO

| Indicador | Estado | Valor |
|-----------|--------|-------|
| **Tiempos** | 🟡 | 73% / 82% (Sem 9 de 11) |
| **Costes** | 🟢 | 68% consumido (4.430€ de 6.520€) |
| **Entregables** | 🟡 | 65% completado |

---

## 2. ESTADO DE ENTREGABLES

| Entregable | Estado | Observaciones |
|------------|--------|---------------|
| **v1.0** - Backend API | 🟢 Entregado | 9 módulos, 44 endpoints, 100% funcional |
| **v2.0** - Portal Tienda | 🟡 En curso | Login, Catálogo, Carrito, Pedidos OK. Falta: detalle pedido, incidencias |
| **v3.0** - Backoffice Admin | 🟠 Retrasado | Solo Dashboard completado. Faltan 7 páginas de gestión |
| **v4.0** - Integraciones | 🟢 Entregado | CSV import/export funcional en backend |
| **Documentación** | 🟢 Entregado | README completo, Swagger API docs |

### Detalle de Funcionalidades

```
COMPLETADO (100%)                    EN CURSO (60%)                 PENDIENTE (20%)
─────────────────                    ──────────────                 ───────────────
✅ API Auth (JWT)                    🔄 Portal: Detalle pedido      ⏳ Backoffice: Usuarios
✅ API Catálogo                      🔄 Portal: Incidencias         ⏳ Backoffice: Organizaciones
✅ API Carrito                                                      ⏳ Backoffice: Catálogo
✅ API Pedidos                                                      ⏳ Backoffice: Pedidos
✅ API Incidencias                                                  ⏳ Backoffice: Incidencias
✅ API Integraciones                                                ⏳ Backoffice: Integraciones
✅ API Reporting                                                    ⏳ Backoffice: Reportes
✅ Login Frontend
✅ Catálogo Frontend
✅ Carrito Frontend
✅ Lista Pedidos Frontend
✅ Dashboard Admin
✅ Base de datos (16 tablas)
✅ Docker/Infraestructura
```

---

## 3. ESTADO DEL PLAN DE PROYECTO

```
        Sem 1-3          Sem 4-5          Sem 6-9          Sem 10-11
        F0-F1            F2               F3               F4-F5
        Requisitos       Diseño           Desarrollo       QA/UAT

Plan:   ████████████     ████████         ████████████████ ████████
        ✅ Completado    ✅ Completado    🔄 En curso      ⏳ Pendiente

Real:   ████████████     ████████         ██████████░░░░░░
                                          ↑
                                     ESTAMOS AQUÍ
                                     (Semana 9)
```

### Hitos

| Hito | Fecha Planificada | Estado |
|------|-------------------|--------|
| Backlog y arquitectura aprobados | Sem 3 | ✅ Completado |
| Demo funcional (checkpoint) | Sem 6 | ✅ Completado |
| UAT y aceptación firmada | Sem 10 | ⏳ Pendiente |
| Go-Live en producción | Sem 11 | ⏳ Pendiente |

---

## 4. ESTADO DE COSTES

### Presupuesto vs Real

| Concepto | Presupuesto | Consumido | Restante | % |
|----------|-------------|-----------|----------|---|
| Alcance Base (Portal/Backoffice) | 3.500€ | 2.450€ | 1.050€ | 70% |
| Integración (1 Distribuidora) | 1.000€ | 800€ | 200€ | 80% |
| Reporting/Notificaciones | 400€ | 320€ | 80€ | 80% |
| Infraestructura | 300€ | 250€ | 50€ | 83% |
| Formación Cliente | 400€ | 200€ | 200€ | 50% |
| Transporte/Reuniones | 250€ | 200€ | 50€ | 80% |
| Comida/Logística | 150€ | 100€ | 50€ | 67% |
| Contingencia (10%) | 520€ | 110€ | 410€ | 21% |
| **TOTAL** | **6.520€** | **4.430€** | **2.090€** | **68%** |

### Horas Consumidas

| Área | Estimadas | Consumidas | Restantes |
|------|-----------|------------|-----------|
| Backend | 160h | 155h | 5h |
| Frontend | 160h | 95h | 65h |
| Diseño/UX | 40h | 35h | 5h |
| QA/Testing | 32h | 10h | 22h |
| Documentación | 16h | 12h | 4h |
| **TOTAL** | **408h** | **307h** | **101h** |

```
PRESUPUESTO                              HORAS

6.520€ ┤████████████████████░░░░░░░░     408h ┤████████████████████░░░░░░░░░░░
       │████████████████████             │████████████████████
       │ Consumido: 4.430€ (68%)         │ Consumidas: 307h (75%)
       │                                 │
       └──────────────────────────       └──────────────────────────────────
```

---

## 5. ANÁLISIS DE DESVIACIONES

### Desviación en Tiempos: +1 semana estimada

**Causa raíz:**
- El desarrollo del backoffice requiere más páginas de las inicialmente estimadas
- Subestimación de la complejidad de las páginas de gestión (CRUD completos)
- Tiempo adicional en configuración de entorno Windows/WSL

**Impacto:**
- Retraso estimado de 1 semana para completar todas las funcionalidades del backoffice
- El flujo principal (Portal Tienda) está 100% operativo

### Desviación en Costes: Dentro del presupuesto

**Estado:** 🟢 Sin desviación significativa
- Consumo actual: 68% del presupuesto
- Avance real: 65% del proyecto
- Margen de contingencia disponible: 410€ (79%)

---

## 6. RIESGOS IDENTIFICADOS

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| No completar backoffice a tiempo | Media | Alto | Priorizar páginas críticas (pedidos, usuarios) |
| Problemas de integración Windows/Node | Baja | Medio | Documentación de troubleshooting creada |
| Falta de tiempo para QA completo | Media | Medio | Testing manual del flujo principal |

---

## 7. ALTERNATIVAS Y ACCIONES PROPUESTAS

### Opción A: Entrega MVP Reducido (Recomendada)
- **Alcance:** Portal completo + Dashboard + 2 páginas backoffice (Pedidos, Usuarios)
- **Tiempo:** Cumple plazo original (Sem 11)
- **Coste:** Dentro del presupuesto
- **Ventaja:** Demuestra flujo completo B2B funcional

### Opción B: Entrega Completa con Extensión
- **Alcance:** Todas las funcionalidades planificadas
- **Tiempo:** +1-2 semanas adicionales (Sem 12-13)
- **Coste:** +500-800€ adicionales
- **Ventaja:** Producto más completo

### Opción C: Entrega Actual "As-Is"
- **Alcance:** Lo que está funcionando hoy
- **Tiempo:** Inmediato
- **Coste:** Sin coste adicional
- **Ventaja:** Sin riesgo de nuevos errores

**Recomendación del equipo:** Opción A - Permite demostrar el valor del proyecto cumpliendo plazos.

---

## 8. ACCIONES INMEDIATAS (Próximas 2 semanas)

| # | Acción | Responsable | Fecha límite |
|---|--------|-------------|--------------|
| 1 | Completar página detalle de pedido (Portal) | Frontend | Sem 10 |
| 2 | Implementar gestión de pedidos (Backoffice) | Frontend | Sem 10 |
| 3 | Testing del flujo completo | QA | Sem 10 |
| 4 | Preparar demo para UAT | PM | Sem 10 |
| 5 | Documentación de usuario final | BA | Sem 11 |
| 6 | Despliegue en entorno de producción | DevOps | Sem 11 |

---

## 9. REGLAS DE JUEGO

### Gestión de Cambios
- Cualquier ampliación de alcance requiere **Solicitud de Cambio (CR)** formal
- Análisis de impacto obligatorio antes de aprobar cambios
- El cliente debe aprobar por escrito

### Comunicación
- **Daily standups:** Lunes, Miércoles, Viernes (15 min)
- **Demo semanal:** Viernes 17:00
- **Canal principal:** Slack #cosmetic-pipeline

### Criterios de Aceptación UAT
- Login funcional con 4 roles
- Flujo completo: Catálogo → Carrito → Pedido
- Dashboard con KPIs reales
- Sin errores críticos bloqueantes

### Entregables Finales
1. Código fuente en repositorio GitHub
2. Documentación técnica (README)
3. Manual de usuario
4. Acceso a entorno de demostración

---

## 10. RESUMEN VISUAL

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        COSMETIC PIPELINE - ESTADO ACTUAL                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   TIEMPOS        COSTES         ENTREGABLES      RIESGOS                   │
│   ┌─────┐        ┌─────┐        ┌─────┐          ┌─────┐                   │
│   │ 73% │        │ 68% │        │ 65% │          │ MED │                   │
│   │ 🟡  │        │ 🟢  │        │ 🟡  │          │ 🟡  │                   │
│   └─────┘        └─────┘        └─────┘          └─────┘                   │
│   Sem 9/11       4.430€/6.520€  Backend OK       1 sem retraso             │
│                                 Frontend 60%     estimado                   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│   DECISIÓN REQUERIDA: Aprobar Opción A (MVP Reducido) para cumplir plazos  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

**Próxima revisión:** Semana 10 (antes de UAT)
**Elaborado por:** Equipo Cosmetic Pipeline
**Aprobado por:** [Pendiente firma PM]
