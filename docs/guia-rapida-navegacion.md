# Guía Rápida de Navegación

## Rutas Principales (Hash-based)

| Hash | Pantalla | Usuario |
|------|----------|---------|
| `#showroom` | Mapa principal | Todos |
| `#app` | Proyecto (inicio) | Todos |
| `#app#inicio` | Hero + descripción | Todos |
| `#app#ubicacion` | Mapa ubicación | Todos |
| `#app#lotizacion` | Mapa lotes + fichas | Compradores/Vendedores |
| `#app#financiamiento` | Opciones de pago | Compradores |
| `#admin` | Dashboard admin | Solo Admin |
| `#vendedor` | Dashboard vendedor | Vendedor/Admin |
| `#privacidad` | Política LPDP | Todos |

---

## Navbar (Siempre visible)

### Desktop
```
[Logo]  Showroom  Proyecto  [Admin]  [Vendedor]
```

### Móvil (Hamburger ☰)
```
☰ → [Showroom, Proyecto, Admin, Vendedor, Privacidad]
```

### Brand (Logo + Nombre)
- Click → Va a `#showroom`
- Muestra nombre del proyecto (desde config)

---

## HeaderNav (Solo en #app)

```
Inicio  Ubicación  Lotización  Financiamiento
```
- Tabs horizontales
- Activo resaltado en azul/primary
- Persiste estado al navegar

---

## Flujo Comprador Típico

```
#showroom
  ↓ (click marcador)
Panel Detalle → WhatsApp / Contactar
  ↓
#app#lotizacion
  ↓ (click lote)
Ficha Técnica → Reservar / WhatsApp
  ↓
#app#financiamiento
  ↓
Contactar / WhatsApp
```

---

## Flujo Vendedor Típico

```
#vendedor (login)
  ↓
Revisa Leads (ordenados por Score)
  ↓
Click lead → WhatsApp pre-llenado
  ↓
Cierra venta → Registra comisión
  ↓
Valida RUC SUNAT → Admin aprueba
  ↓
Factura generada → Estado "Pagado"
```

---

## Flujo Admin Típico

```
#admin (login)
  ↓
Dashboard: métricas tiempo real
  ↓
Propiedades: cambia estados, ve clicks
  ↓
Leads: reasigna vendedores
  ↓
Comisiones: configura reglas %
  ↓
Auditoría: revisa logs
```

---

## Atajos Globales

| Tecla | Contexto | Acción |
|-------|----------|--------|
| `Esc` | Modal/Panel abierto | Cerrar |
| `Tab` | Cualquier foco | Siguiente elemento |
| `Shift+Tab` | Cualquier foco | Elemento anterior |
| `Enter` | Botón enfocado | Activar |
| `Espacio` | Checkbox/Radio | Toggle |

---

## Indicadores Visuales

| Elemento | Significado |
|----------|-------------|
| 🟢 Verde | Disponible / Aprobado / Online |
| 🟡 Amarillo | Separado / Pendiente / Offline |
| 🔴 Rojo | Vendido / Error / Crítico |
| 🔵 Azul | Info / Pagado / Primario |
| 🟠 Naranja | Advertencia / Modo offline |

---

## PWA (Móvil)

| Acción | Cómo |
|--------|------|
| Instalar | Chrome: ⋮ → Instalar app / Safari: ⬆️ → Añadir a inicio |
| Offline | Funciona tras 1ra carga; banner naranja si sin red |
| Actualizar | Auto al deploy; prompt "Nueva versión disponible" |

---

## Soporte Rápido

| Problema | Solución |
|----------|----------|
| No carga mapa | Verificar conexión / recargar |
| WhatsApp no abre | Verificar teléfono en propiedad / probar desktop |
| No ve #admin | Verificar login + rol `admin` en `usuarios_rol` |
| Score no actualiza | Esperar sync (máx 1 min) / recalcular manual |
| RUC inválido | Verificar 11 dígitos / consultar SUNAT directo |

---

*Guía Rápida — v1.2.0*