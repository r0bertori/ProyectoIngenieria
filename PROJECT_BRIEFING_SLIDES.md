# PROJECT BRIEFING - COSMETIC PIPELINE
## Contenido para PowerPoint (3 Slides)

---

# ══════════════════════════════════════════════════════════════════
# SLIDE 1: Estado General del Proyecto
# ══════════════════════════════════════════════════════════════════

## TÍTULO:
Cosmetic Pipeline - Project Briefing

## SUBTÍTULO:
Fecha: 15/04/2026 | Versión: v3.1 | Semana 9 de 11

---

## INDICADORES PRINCIPALES (3 cajas con colores)

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   73% / 82%     │  │      68%        │  │      65%        │
│    TIEMPOS      │  │     COSTES      │  │   ENTREGABLES   │
│      🟡         │  │       🟢        │  │       🟡        │
│    Semana 9     │  │  4.430€/6.520€  │  │  Backend 100%   │
│    de 11        │  │                 │  │  Frontend 60%   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
   COLOR: AMARILLO      COLOR: VERDE        COLOR: AMARILLO

---

## TABLA DE ENTREGABLES

| Nombre          | Estado                    |
|-----------------|---------------------------|
| v1.0 Backend    | ✅ ENTREGADO (verde)      |
| v2.0 Portal     | 🔄 EN CURSO (amarillo)    |
| v3.0 Backoffice | ⚠️ RETRASADO (naranja)    |
| v4.0 Integración| ✅ ENTREGADO (verde)      |

---

## GRÁFICO GANTT SIMPLIFICADO (parte inferior)

        Sem 1-3      Sem 4-5      Sem 6-9       Sem 10-11
        ─────────────────────────────────────────────────►
Plan:   ██████████   ████████     ████████████  ████████
Real:   ██████████   ████████     ████████░░░░
                                       ↑
                                  HOY (Sem 9)

Colores: Azul = Completado, Gris = Pendiente
Línea roja vertical = Fecha actual



# ══════════════════════════════════════════════════════════════════
# SLIDE 2: Costes y Avance Detallado
# ══════════════════════════════════════════════════════════════════

## TÍTULO:
Estado de Costes y Progreso

---

## TABLA DE COSTES (lado izquierdo)

| Concepto              | Presupuesto | Consumido | %   |
|-----------------------|-------------|-----------|-----|
| Alcance Base          | 3.500€      | 2.450€    | 70% |
| Integración           | 1.000€      | 800€      | 80% |
| Reporting/APIs        | 400€        | 320€      | 80% |
| Infraestructura       | 300€        | 250€      | 83% |
| Formación             | 400€        | 200€      | 50% |
| Transporte/Reuniones  | 400€        | 300€      | 75% |
| Contingencia (10%)    | 520€        | 110€      | 21% |
| **TOTAL**             | **6.520€**  | **4.430€**| **68%** |

---

## GRÁFICO DE BARRAS - HORAS (lado derecho)

Backend     ████████████████████████████████░░░  155h/160h (97%)
Frontend    ████████████████░░░░░░░░░░░░░░░░░░   95h/160h (59%)
Diseño/QA   ████████████████████████░░░░░░░░░░   57h/88h  (65%)

TOTAL: 307h de 408h consumidas (75%)

---

## GRÁFICO CIRCULAR - PRESUPUESTO (opcional, centro inferior)

        ┌───────────┐
       /   68%      \
      │  CONSUMIDO   │   32% RESTANTE
       \   4.430€   /    2.090€
        └───────────┘



# ══════════════════════════════════════════════════════════════════
# SLIDE 3: Desviaciones, Alternativas y Acciones
# ══════════════════════════════════════════════════════════════════

## TÍTULO:
Análisis y Plan de Acción

---

## DESVIACIONES (cuadro superior izquierdo)

⚠️ DESVIACIÓN EN TIEMPOS: +1 semana estimada

Causas:
• Backoffice más complejo de lo estimado
• Configuración entorno Windows/WSL
• 7 páginas de gestión pendientes

Impacto:
• Flujo principal (Portal) 100% operativo
• Backoffice parcialmente completado

---

## ALTERNATIVAS (cuadro superior derecho)

| Opción | Descripción | Plazo | Coste |
|--------|-------------|-------|-------|
| **A (Recomendada)** | MVP reducido: Portal + Dashboard + 2 páginas backoffice | Sem 11 ✅ | 6.520€ ✅ |
| B | Entrega completa | Sem 12-13 | +800€ |
| C | Entrega actual | Inmediato | Sin cambio |

✅ **RECOMENDACIÓN: OPCIÓN A**

---

## ACCIONES PRÓXIMAS 2 SEMANAS (cuadro inferior)

| # | Acción | Responsable | Fecha |
|---|--------|-------------|-------|
| 1 | Completar detalle de pedido | Frontend | Sem 10 |
| 2 | Página gestión pedidos (Backoffice) | Frontend | Sem 10 |
| 3 | Testing flujo completo | QA | Sem 10 |
| 4 | Demo UAT | PM | Sem 10 |
| 5 | Documentación usuario | BA | Sem 11 |
| 6 | Despliegue producción | DevOps | Sem 11 |

---

## PIE DE SLIDE

**Decisión requerida:** Aprobar Opción A para cumplir plazos
**Próxima revisión:** Semana 10 (antes de UAT)
**Equipo:** A. Rodas, M.A. Rodríguez, A. Medina, R. Ruiz



# ══════════════════════════════════════════════════════════════════
# NOTAS DE DISEÑO PARA POWERPOINT
# ══════════════════════════════════════════════════════════════════

## Colores sugeridos:
- Verde (#28A745): Estado OK, Entregado
- Amarillo (#FFC107): En curso, Alerta menor
- Naranja (#FD7E14): Retrasado
- Rojo (#DC3545): Crítico (no usado en este caso)
- Azul (#007BFF): Barras de progreso, acentos

## Tipografía:
- Títulos: 28-32pt, Negrita
- Subtítulos: 18-24pt
- Cuerpo: 14-16pt
- Tablas: 12-14pt

## Plantilla UE:
- Usar plantilla oficial Universidad Europea si está disponible
- Logo UE en esquina inferior derecha
- Colores corporativos: Rojo UE (#E30613)

## Iconos sugeridos:
- ✅ Check verde para completado
- 🔄 Flechas para en curso
- ⚠️ Triángulo para alertas
- 📊 Gráfico para métricas
- 💶 Euro para costes
- ⏱️ Reloj para tiempos
