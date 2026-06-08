# Manual de Usuario — Comprador (Showroom)

## Bienvenido al Showroom Digital Inmobiliario

Esta guía te ayudará a navegar y usar el showroom para encontrar tu propiedad ideal.

---

## 1. Acceso y Navegación

### Pantalla Principal (#showroom)
- **Mapa interactivo**: Visualiza todas las propiedades en un mapa
- **Panel lateral**: Filtros por estado, precio, tipo de propiedad
- **Navbar superior**: Navegación entre Showroom, Proyecto, Admin, Vendedor

### Accesos directos
| Ruta | Descripción |
|------|-------------|
| `#showroom` | Mapa principal con todas las propiedades |
| `#app` | Detalle del proyecto (inicio, ubicación, lotización, financiamiento) |
| `#privacidad` | Política de privacidad LPDP |

---

## 2. Uso del Mapa

### Controles del mapa
- **Zoom**: Rueda del mouse / botones +/- / pellizco en móvil
- **Geolocalización**: Botón de brújula (centra en tu ubicación)
- **Capas**: Botón de capas (cambia entre mapa base, satélite, etc.)

### Marcadores
- **Círculos de 16px** coloreados por estado:
  - 🟢 Verde = Disponible
  - 🟡 Amarillo = Separado
  - 🔴 Rojo = Vendido

### Panel lateral (filtros)
1. **Estado**: Disponible / Separado / Vendido / Todos
2. **Precio**: Rango mínimo - máximo (PEN/USD)
3. **Tipo**: Lote / Departamento / Casa / Local / Oficina / Terreno
4. **Moneda**: PEN / USD

---

## 3. Ver Detalle de Propiedad

### Desde el mapa
1. Haz clic en cualquier marcador
2. Se abre el **panel de detalle** (modal en desktop, slide en móvil)

### Información mostrada
- **Título y ubicación** (distrito, ciudad)
- **Galería de imágenes** (navegación con flechas)
- **Especificaciones técnicas**:
  - Área (m²)
  - Cuartos / Baños
  - Precio y moneda
- **Descripción** completa

---

## 4. Contactar al Vendedor

### Botón "Contactar"
- Abre formulario de contacto con **Turnstile anti-bot**
- Requiere consentimiento LPDP (Ley 29733)
- Envía tus datos al vendedor asignado

### Botón WhatsApp 💬
- **Junto a "Contactar"** en la ficha de propiedad
- Abre WhatsApp con mensaje pre-llenado:
  > "Hola, me interesa [TÍTULO] a S/[PRECIO]. ¿Podría darme más información?"
- Funciona en:
  - **Móvil**: Abre app de WhatsApp
  - **Desktop**: Abre WhatsApp Web

---

## 5. Vista Proyecto (#app)

### Pestañas (HeaderNav secundario)
| Pestaña | Contenido |
|---------|-----------|
| **Inicio** | Hero del proyecto, descripción, tour 360° |
| **Ubicación** | Mapa de ubicación, coordenadas, dirección |
| **Lotización** | Mapa interactivo de lotes con ficha técnica |
| **Financiamiento** | Opciones de financiamiento disponibles |

### Navegación en Lotización
1. Haz clic en un lote → Se abre **Ficha Técnica**
2. Muestra: código, área, precio, estado, vendedor asignado
3. Botones: **Reservar** / **Contactar** / **WhatsApp**

---

## 6. Acceso Móvil (PWA)

### Instalar como App
1. Abre en Chrome/Safari móvil
2. Menú → **"Instalar aplicación"** / **"Añadir a pantalla de inicio"**
3. Funciona **offline** tras primera carga

### Indicador Offline
- Banner naranja "Modo offline" al perder conexión
- Navegación por propiedades ya cargadas disponible

---

## 7. Privacidad (LPDP)

### Tus derechos (Ley 29733)
- Acceso, rectificación, cancelación, oposición
- Consentimiento explícito en formulario
- Datos: nombre, email, teléfono, consent_timestamp, IP, user_agent

### Política completa
Ruta: `#privacidad` o enlace en footer

---

## 8. Atajos de Teclado

| Tecla | Acción |
|-------|--------|
| `Esc` | Cerrar modal / panel detalle |
| `Tab` | Navegación por elementos |
| `Enter` | Activar botón enfocado |

---

## 9. Soporte

- **Email**: Desde formulario de contacto
- **WhatsApp**: Botón en cada propiedad
- **Privacidad**: `#privacidad`

---

*Showroom Digital Inmobiliario — v1.2.0*