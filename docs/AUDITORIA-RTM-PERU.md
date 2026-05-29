# Auditoría RTM - Showroom Digital Inmobiliario (Perú)

## 1. Matriz de Trazabilidad de Requerimientos

| REQ | Descripción | Solución Técnica | Campos BD | Status |
|-----|-------------|-----------------|-----------|--------|
| **REQ-01** | Control de stock (Disponible/Separado/Vendido) | `estado` enum en tabla `propiedades`, `cambiarEstado()` en repositorio | `estado` enum('disponible','separado','vendido'), `propiedades.estado` | ✅ |
| **REQ-01.1** | Separación vía CCI bancario | Flow: Lead → separado → pago (integración futura) | `leads.estado` workflow | ⚠️ Pendiente integración pasarela |
| **REQ-02** | Dashboard avance ventas | RPC `obtener_metricas_dashboard(p_agencia_id)` | `total_propiedades`, `disponibles`, `separadas`, `vendidas`, `avance_porcentaje` | ✅ |
| **REQ-02.1** | Visualización bimoneda PEN/USD | Campo `moneda` enum en `propiedades`, formateo en frontend | `propiedades.moneda` CHECK('PEN','USD'), `formatPrice()` | ✅ |
| **REQ-03** | Métricas de interés (clicks) | Hook `useClickTracker()` → `metricas_clicks` | `propiedad_id`, `tipo_evento`, `sesion_id`, `created_at` | ✅ |
| **REQ-03.1** | Top clicks ranking | RPC `obtener_top_clicks(p_agencia_id, p_limite)` | `propiedad_id`, `count(clicks)` | ✅ |

## 2. Cumplimiento Normativo Local (Perú)

### LPDP N° 29733 - Protección de Datos Personales
| Elemento | Cumplimiento | Evidencia |
|----------|------------|---------|
| Consentimiento explícito | ✅ | `LeadForm` checkbox REQUIRED + texto: "He leído y acepto la Política de Privacidad según la Ley N° 29733" |
| Datos mínimos | ✅ | Solo `nombre`, `email`, `telefono` en `leads` |
| Anonymous tracking | ✅ | `sesion_id` = UUID sin IP tracking en `metricas_clicks` |
| Borrado automático | ⚠️ | Leads no tienen TTL - requiere trigger 30 días |

### Recomendación: Trigger de borrado LPDP
```sql
-- Agregar a migrations
create or replace function public.cleanup_old_leads()
returns trigger language plpgsql as $$
begin
  delete from public.leads where created_at < now() - interval '30 days';
  return new;
end;
$$;

create trigger monthly_cleanup 
  after insert on public.leads 
  for each statement 
  execute function public.cleanup_old_leads();
```

## 3. Optimización de Infraestructura (Latencia Perú)

| Aspecto | Configuración Actual | Recomendación |
|---------|-------------------|-------------|
| Supabase región | Por defecto (us-east-1) | Cambiar a `southamerica-east-1` (São Paulo) en dashboard |
| CDN imágenes | GitHub Pages | Recomendar Cloudflare R2 o Supabase Storage con CDN |
| Renders pesados | Bundle 86KB CSS/758KB JS | Implementar lazy loading + WebP/AVIF |

**Código para región Peruana (Supabase Dashboard):**
- Region: South America (São Paulo) `sa-east-1`
- Alternativa: AWS `us-west-2` (Oregon) para mejor latencia Lima

## 4. Escenario QA - Flujo Comercial Perú

### Setup
- **Agencia:** Constructora Horizonte (ID fijo en `.env.local`)
- **Propiedad:** DEPA-SI-204 (San Isidro)

### Paso 1: Asesor separa desde San Isidro
```sql
-- Acción: agente hace click "Cambiar Estado" → separado
UPDATE propiedades 
SET estado = 'separado', updated_at = now()
WHERE id = 'uuid-propiedad';

-- Verifica RLS: solo agente de su agencia puede actualizar
SELECT * FROM propiedades WHERE agencia_id = 'agente-agencia';
```

### Paso 2: Cliente ve cambio desde Miraflores/Trujillo
- **React Query:** auto-refetch cada 30 segundos (TTL)
- **Simulación:** Abrir página desde móvil, esperar 30-60 seg
- **Expected:** Badge cambia a "Separado" sin refresh manual

### Paso 3: Click tracking asíncrono
- **Hook:** `useClickTracker` con debounce 100ms
- **Payload:** `{ propiedad_id, tipo_evento: 'click', sesion_id, pagina_origen }`
- **No bloqueo:** Mutación no espera respuesta (fire-and-forget)

## 5. Métricas de Aceptación Técnica

| Métrica | Target | Implementation |
|---------|--------|--------------|
| Latencia API calls | < 200ms (Lima) | RPC optimizado + índices |
| Build size | < 500KB JS | ⚠️ Actual 758KB - code splitting pendiente |
| CLS (Core Web Vitals) | < 0.1 | Lazy loading imágenes |
| Disponibilidad | 99.9% | GitHub Pages SLA |
| Tiempo real stock | < 60s | React Query stale-time 30s |

## 6. Campos BD Específicos Perú

| Tabla | Campo | Uso Perú |
|-------|-------|---------|
| `propiedades` | `moneda` | S/ (PEN) vs $ (USD) |
| `propiedades` | `distrito` | San Isidro, Miraflores, Surco, Barranco |
| `propiedades` | `ciudad` | Default 'Lima' |
| `leads` | `telefono` | Formato +51 XXXXXXXXX |
| `metricas_clicks` | `sesion_id` | UUID sin datos personales |

---

# INFORME DE AUDITORÍA TÉCNICA Y DISEÑO FRONTEND (MVP PERÚ)

**Responsable Tecnológico:** Diego Medardo Saavedra García

**Componentes Evaluados:** Showroom Principal (Móvil) y Acceso Administrativo (Autenticación)

## 1. Validación de UI/UX frente a Requerimientos de Negocio

El análisis del código HTML/Tailwind demuestra correspondencia exacta con reglas de negocio peruanas:

### A. Soporte Bimoneda y Consistencia Comercial (REQ-02)
- **Implementación en UI:** Detalle de propiedad muestra precio dual: **$450,000** y **S/ 1,690,000**
- **Impacto:** Evita fricción cognitiva, respeta estándar bimoneda peruano

### B. Blindaje Legal Automático (LPDP N° 29733)
- **Mecanismo de Consentimiento:** Formulario LeadForm incluye checkbox REQUIRED con texto exacto: "He leído y acepto la Política de Privacidad según la Ley N° 29733"
- **Prefijo telefónico:** Campo muestra +51 fijo para validación local

## 2. Métricas de Rendimiento y Carga Visual

| Aspecto | Implementación | Target Perú |
|---------|---------------|-------------|
| Map container | `h-[442px]` con `object-cover` | Optimizado móvil |
| Marker animation | `map-marker-pulse` CSS | 60fps en móviles |
| Bottom sheet | `transform transition duration-300` | Sin bloqueo CPU |

## 3. Matriz de Trazabilidad UI-Diseño (RTM-UI)

| Componente UI | Elemento | Status | Observación |
|-------------|----------|--------|-------------|
| Showroom | `id="detail-panel"` (Bottom Sheet) | ✅ | Touch handlers implementados |
| Captura Leads | `id="contact-form"` | ✅ | Prefijo +51 fijo |
| Login Admin | `id="loginForm"` | ⚠️ | Conectar a Supabase Auth |

## 4. Ajustes Técnicos para Integración

### A. Mapeo de Atributos Dinámicos
```tsx
// Estados dinámicos en tarjetas
const estadoClasses = {
  disponible: "bg-tertiary/10 text-tertiary",
  separado: "bg-secondary/10 text-secondary",
  vendido: "bg-error/10 text-error"
};
```

### B. Sync de Clicks Asíncrona
```tsx
// En MapView handleMarkerClick
const { trackClick } = useClickTracker();
const handleMarkerClick = useCallback((p: Propiedad) => {
  setSelected(p);
  setDetailOpen(true);
  trackClick(p.id); // Fire-and-forget
}, [trackClick]);
```

## Conclusión
Diseño premium compatible con mercado inmobiliario Lima Top. Integración limpia con base de datos y arquitectura Serverless.