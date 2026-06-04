# Spec: Rediseño UI Showroom Digital

## Requirements

### RF-01: Showroom Layout
El mapa debe ocupar 66% del ancho, sidebar de 320px a la izquierda con filtros.

### RF-02: Property Filters
- Filtro por Tipo (Departamento, Casa, Oficina)
- Filtro por Distrito (San Isidro, Miraflores, Surco, Barranco)
- Filtro por Precio Máximo
- Filtro por Estado (Disponible, Separado, Vendido)
- Botón limpiar filtros

### RF-03: Property Cards
- Imagen thumbnail superior izquierda
- Badge de estado (verde/ámbar/rojo)
- Información: título, distrito, precio
- Estado: disponible/separdao/vendido

### RF-04: Map Markers
- Circle markers coloreados por estado
- Hover tooltip con precio
- Click abre panel detalle

### RF-05: Dashboard Métricas
Cards con:
- Total Propiedades (número)
- Disponibles (% barra)
- Separados (número)
- Vendidos (acumulado)
- Total Leads (con % conversión)
- % Avance (porcentaje total)

### RF-06: Gráfico Donut
SVG con segmentos:
- Verde: Disponible (60%)
- Ámbar: Separado (15%)
- Terracotta: Vendido (25%)
- Centro: Total unidades

### RF-07: Ranking Top Clicks
Tabla con:
- Rank (1,2,3)
- Código propiedad
- Thumbnail + título
- Total clicks (número)

### RF-08: Property Detail Slide-over
Panel derecho (420px) con:
- Hero image con overlay degradado
- Badge estado en esquina superior
- Specs grid: área, dormitorios, baños
- Descripción detallada
- Características como tags
- CTA sticky: "Contactar"

### RF-09: Login Screen
- Logo "Showroom Inmobiliario" centrado
- Email input con icono mail
- Password input con toggle visibility
- Remember me checkbox
- Link recuperar contraseña
- Submit button con loading state
- Política LPDP (Ley 29733) link

## Scenarios

### Escenario 1: Usuario navega propiedades
```
Dado: User en showroom
Cuando: Aplica filtro "Disponible" + "San Isidro"
Entonces: Mapa muestra solo propiedades filtradas
Y: Sidebar lista cards filtradas
```

### Escenario 2: Admin ve dashboard
```
Dado: Admin autenticado
Cuando: Accede a /#admin
Entonces: Ve 6 cards métricas
Y: Gráfico donut con distribución
Y: Tabla top propiedades por clicks
```

### Escenario 3: Usuario solicita información
```
Dado: Usuario en PropertyDetailPanel
Cuando: Hace click en "Contactar"
Entonces: Se abre LeadForm
Y: Checkbox política de privacidad REQUIRED
```