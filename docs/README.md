# Documentación del Proyecto

## Manuales de Usuario

| Manual | Audiencia | Archivo |
|--------|-----------|---------|
| **Manual Comprador** | Usuarios finales, compradores | `manual-usuario-comprador.md` |
| **Manual Vendedor** | Vendedores, agentes inmobiliarios | `manual-usuario-vendedor.md` |
| **Manual Administrador** | Admins, gestores de proyecto | `manual-administrador.md` |
| **Guía Rápida** | Referencia rápida para todos | `guia-rapida-navegacion.md` |

## Capturas de Pantalla

Directorio: `screenshots/`

| Archivo | Descripción |
|---------|-------------|
| `01-showroom-home.png` | Pantalla inicial #showroom |
| `02-showroom-map.png` | Mapa con marcadores |
| `03-app-proyecto.png` | Vista Proyecto (#app) |
| `04-app-inicio.png` | Pestaña Inicio |
| `05-app-ubicacion.png` | Pestaña Ubicación |
| `06-app-lotizacion.png` | Pestaña Lotización |
| `07-app-financiamiento.png` | Pestaña Financiamiento |
| `08-admin-dashboard.png` | Dashboard Admin |
| `09-vendedor-dashboard.png` | Dashboard Vendedor |
| `10-privacidad.png` | Política de Privacidad |
| `mobile-*.png` | Versiones móviles (390x844) |

## Documentación Técnica

| Archivo | Descripción |
|---------|-------------|
| `../README.md` | Documentación principal del repo |
| `../DESIGN.md` | Sistema de diseño (Stitch Andean Modernity) |
| `../INFORME_TENDENCIAS_PROPTECH_PERU_2026.md` | Research de mercado |
| `../SDD-REFACTOR-LOTIZACION.md` | Especificación de refactor (histórico) |
| `../docs/CLOSE-DECISIONS-LOTIZACION.md` | Decisiones pendientes con cliente |

## Migraciones de Base de Datos

| Migración | Tablas | Descripción |
|-----------|--------|-------------|
| `00021` | `lead_events` | Tracking engagement |
| `00022` | `lead_scores` + RPC | Lead scoring |
| `00023` | `commission_rules`, `vendedor_commissions`, `invoices` | Comisiones + SUNAT |
| `00028` | `tours` | Coordenadas centro del panorama |
| `00029` | `tours` | Backfill de coordenadas |
| `00030` | `analytics_events` | Eventos de analytics del tour |
| `00031` | `tour_pois` | Puntos de interés del tour |

## Comandos Útiles

```bash
# Desarrollo
pnpm dev                    # Servidor dev (localhost:5173)
pnpm build                  # Build producción (out/)
pnpm preview                # Preview build

# Tests
pnpm test                   # Unit tests (Vitest)
pnpm test:e2e               # E2E (Playwright)
pnpm verify                 # typecheck + lint + test + build

# Deploy
git push origin main        # Trigger GitHub Actions → GitHub Pages
```

---

*Documentación v1.2.0 — Showroom Digital Inmobiliario*