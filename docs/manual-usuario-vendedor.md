# Manual de Usuario — Vendedor (Dashboard)

## Panel de Vendedor

Acceso: `#vendedor` (requiere login con rol `vendedor`)

---

## 1. Resumen Ejecutivo (Header)

| Métrica | Descripción |
|---------|-------------|
| **Leads Activos** | Total de leads con score > 0 |
| **Score Promedio** | Media de scores de tus leads |
| **Comisiones Pendientes** | Suma de comisiones en estado "Pendiente" |
| **Top Property** | Propiedad con más engagement |

---

## 2. Leads del Equipo (TeamLeadsView)

### Vista de tabla
| Columna | Descripción |
|---------|-------------|
| **Visitante** | ID anonimizado del lead |
| **Score** | 0-100 (Alto/Medio/Bajo con badges de color) |
| **Propiedad** | Última propiedad visitada |
| **Eventos** | Vistas / Clicks WhatsApp / Tiempo / Repeticiones |
| **Última actividad** | Timestamp del último evento |

### Filtros
- **Por score**: Alto (≥70) / Medio (40-69) / Bajo (<40)
- **Por propiedad**: Filtrar leads por propiedad específica
- **Ordenamiento**: Score descendente / Fecha ascendente

### Algoritmo de Scoring
```
Score = 10 (baseline) 
      + Vistas × 10
      + Clicks WhatsApp × 25
      + Segundos en página / 3
      + Repeticiones × 15
Máximo: 100
```

---

## 3. Comisiones (CommissionTable)

### Estados
| Badge | Color | Significado |
|-------|-------|-------------|
| **Pendiente** | 🟡 Amarillo | Venta registrada, pendiente aprobación |
| **Aprobado** | 🟢 Verde | Aprobada por admin, lista para pago |
| **Pagado** | 🔵 Azul | Comisión pagada, factura generada |

### Tabla
- **Propiedad**: Código + título (clic para ver detalle)
- **Precio venta**: Precio final de la transacción
- **% Comisión**: Según regla aplicable
- **Monto**: Calculado automáticamente
- **Estado**: Badge + fecha de cambio
- **Factura SUNAT**: ID de factura (si estado = Pagado)

### Reglas de comisión (configurables por Admin)
```
Ejemplo:
  0 - 200,000     → 3%
  200,001 - 500,000 → 2.5%
  500,001+        → 2%
```

---

## 4. Validación SUNAT (RUC)

### Al registrar comisión
1. Sistema valida RUC del comprador automáticamente
2. **Cache 24h** en localStorage (evita llamadas repetidas)
3. Si válido: muestra **Razón Social**
4. Si inválido: alerta + bloquea facturación

### Formato RUC válido
- **11 dígitos** (personas jurídicas)
- Ejemplo: `20123456789`

---

## 5. Flujo de Trabajo Diario

### Mañana
1. Abre `#vendedor`
2. Revisa **Leads Activos** → Prioriza score "Alto"
3. Contacta leads vía WhatsApp (botón en tabla)

### Durante el día
1. Registra visitas en ficha de propiedad
2. Actualiza estado de comisiones tras cierre
3. Valida RUC de compradores nuevos

### Cierre
1. Verifica comisiones "Pendiente" → solicita aprobación a Admin
2. Exporta reporte si necesario (próxima versión)

---

## 6. Permisos

| Acción | Vendedor | Admin |
|--------|----------|-------|
| Ver leads propios | ✅ | ✅ |
| Ver leads del equipo | ✅ | ✅ |
| Editar comisiones | ❌ | ✅ |
| Aprobar comisiones | ❌ | ✅ |
| Configurar reglas % | ❌ | ✅ |
| Validar RUC SUNAT | ✅ (auto) | ✅ |

---

## 7. Atajos

| Tecla | Acción |
|-------|--------|
| `Esc` | Cerrar modales |
| `Tab` | Navegar tabla |
| `Enter` | Abrir ficha lead |

---

*Panel Vendedor — v1.2.0*