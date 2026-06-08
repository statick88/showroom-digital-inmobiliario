# Manual de Administrador

## Panel de Administración

Acceso: `#admin` (requiere login con rol `admin`)

---

## 1. Dashboard Principal

### Métricas en tiempo real (Supabase Realtime)
- **Total propiedades** + gráfico donut por estado
- **Progreso de venta** (barra de progreso)
- **Top 5 propiedades** más clickeadas
- **Leads recientes** con estado

### Actualización automática
- Cambios en BD → UI se actualiza sin recargar
- Indicador verde "Conectado" en header

---

## 2. Gestión de Propiedades

### Tabla con acciones
| Columna | Acción |
|---------|--------|
| Código / Título | Identificador |
| Tipo / Estado | Badge colorido |
| Precio / Moneda | PEN / USD |
| Clicks | Contador + enlace a analytics |
| **Acciones** | Editar / Cambiar estado / Eliminar |

### Cambio de estado inline
1. Click en badge de estado
2. Selecciona nuevo estado: Disponible / Separado / Vendido
3. **Confirmación obligatoria** (modal)
4. Si "Vendido": abre modal de **método de pago** + **CCI**
5. Guardar → Actualiza tabla + Realtime

### Filtros
- Búsqueda por código/título
- Filtro por estado
- Filtro por tipo
- Paginación (10/25/50 por página)

---

## 3. Gestión de Leads

### Tabla de leads
| Campo | Descripción |
|-------|-------------|
| Nombre / Email / Teléfono | Datos del interesado |
| Propiedad | Enlace a ficha |
| Score | 0-100 + badge |
| Estado | Nuevo / Contactado / Calificado / Perdido / Ganado |
| Vendedor asignado | Nombre + botón reasignar |
| Acciones | Ver detalle / Cambiar estado / Notas |

### Reasignar vendedor
1. Click en "Reasignar" → Modal con lista de vendedores
2. Selecciona → Guarda → Notificación al vendedor

---

## 4. Configuración de Comisiones

### Reglas de comisión (commission_rules)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| Precio mínimo | Number | Inclusive |
| Precio máximo | Number | Inclusive (null = sin límite) |
| Porcentaje | Decimal | Ej: 3.00 = 3% |
| Activo | Boolean | Habilitar/deshabilitar |

### Crear/Editar regla
1. Botón "Nueva regla"
2. Completa rangos sin solapamiento
3. Guarda → Disponible inmediato para vendedores

### Ejemplo configuración
```
| Min      | Max        | %    |
|----------|------------|------|
| 0        | 200,000    | 3.0% |
| 200,001  | 500,000    | 2.5% |
| 500,001  | (vacío)    | 2.0% |
```

---

## 5. Auditoría y Logs

### Tabla `audit_log`
- **Todos los cambios** de estado, leads, comisiones
- Campos: usuario, tabla, registro_id, campo, valor_anterior, valor_nuevo, timestamp
- Filtros: por tabla, usuario, rango de fechas
- Exportable a CSV (próxima versión)

---

## 6. Usuarios y Roles

### Tabla `usuarios_rol`
| Campo | Valores |
|-------|---------|
| rol | `admin` / `vendedor` / `comprador` |
| auth_user_id | UUID de Supabase Auth |
| proyecto_id | (opcional) Proyecto asignado |

### Crear vendedor
1. Usuario se registra en Supabase Auth
2. Admin añade fila en `usuarios_rol` con `rol = 'vendedor'`
3. Opcional: asigna `proyecto_id`

---

## 7. Configuración del Proyecto

### Variables de entorno (GitHub Secrets)
| Secret | Descripción |
|--------|-------------|
| `VITE_SUPABASE_URL` | URL proyecto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clave pública (anon) |
| `VITE_PROYECTO_ID` | UUID del proyecto activo |
| `VITE_AGENCIA_ID` | UUID de la agencia |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile |

---

## 8. Supabase Realtime

### Habilitar tablas
```sql
-- Desde dashboard Supabase > Realtime > Publications
alter publication supabase_realtime add table propiedades;
alter publication supabase_realtime add table lotes;
alter publication supabase_realtime add table leads;
alter publication supabase_realtime add table vendedor_commissions;
```

---

## 9. Deploy y CI/CD

### GitHub Actions
- Push a `main` → Deploy automático a GitHub Pages
- Jobs: security-scan → build → E2E tests → deploy
- URL: `https://statick88.github.io/showroom-digital-inmobiliario/`

### Verificar deploy
1. GitHub Actions → "Deploy to GitHub Pages" → ✅ verde
2. Accede a URL producción
3. Prueba rutas: `#showroom`, `#app`, `#admin`, `#vendedor`

---

*Panel Administrador — v1.2.0*