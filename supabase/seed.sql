-- =============================================================================
-- SHOWROOM DIGITAL INMOBILIARIO — Seed completo de datos de prueba (UUIDs válidos)
-- =============================================================================
-- Idempotente: usa ON CONFLICT DO UPDATE
-- UUIDs generados: formato estándar 8-4-4-4-12
-- Fuente: docs/lotes/Estructura_Precios_y_Base_Datos_Demo.xlsx
-- =============================================================================

-- =============================================================================
-- 1. AGENCIAS (legacy)
-- =============================================================================
insert into public.agencias (id, nombre, plan, ruc, direccion, telefono, activa)
values
  ('d785bbc3-1cc0-4157-b47c-a2a3e0c2ad8c', 'Inmobiliaria Demo',       'premium', '20123456789', 'Av. Larco 123, Miraflores',     '01-2345678', true),
  ('a3f1c2b4-5d6e-7f89-0a1b-2c3d4e5f6a7b', 'Urbanizaciones del Sur', 'premium', '20987654321', 'Calle Lima 456, Surco',         '01-8765432', true),
  ('b7e8f9a0-1b2c-3d4e-5f6a-7b8c9d0e1f2a', 'Bimoneta Constructora',  'gratis',  '20555555555', 'Av. Javier Prado 789, San Isidro', '01-5551234', true)
on conflict (id) do update set
  nombre = excluded.nombre,
  plan   = excluded.plan,
  ruc    = excluded.ruc,
  direccion   = excluded.direccion,
  telefono    = excluded.telefono,
  activa      = excluded.activa,
  updated_at  = now();

-- =============================================================================
-- 2. PROYECTOS (lotización)
-- =============================================================================
insert into public.proyectos (id, nombre, descripcion, ubicacion, coordenadas_centro, imagen_hero, activo)
values
  ('619882a9-4783-43b9-b902-74d10e491a70', 'Urbanización Los Olivos', 'Proyecto residencial en Ayacucho, Perú.',        'Ayacucho, Perú', '{"lat": -13.093056, "lng": -74.216718}', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=400&fit=crop', true),
  ('7c8d9e0f-1a2b-4c3d-4e5f-6a7b8c9d0e1f', 'Residencial San Felipe', 'Condominio de casas en Jesús María.',         'Calle San Felipe 200, Jesús María',      '{"lat": -12.1150, "lng": -77.0300}', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=400&fit=crop',   true),
  ('9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d', 'Torres del Sur',          'Edificio de departamentos en Villa El Salvador.', 'Av. Distrital 500, Villa El Salvador', '{"lat": -12.2200, "lng": -76.9700}', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=400&fit=crop', true)
on conflict (id) do update set
  nombre             = excluded.nombre,
  descripcion        = excluded.descripcion,
  ubicacion          = excluded.ubicacion,
  coordenadas_centro = excluded.coordenadas_centro,
  imagen_hero        = excluded.imagen_hero,
  activo             = excluded.activo,
  updated_at         = now();

-- =============================================================================
-- 3. USUARIOS / VENDEDORES (usuarios_rol) — sin auth_user_id
-- =============================================================================
insert into public.usuarios_rol (id, email, nombre, rol, telefono, activo)
values
  ('5adf837d-da5b-435f-acfa-0508ac3b602e', 'admin@showroom.test',    'Admin Sistema',  'admin',    '999-000-001', true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'vendedor1@showroom.test','María López',    'vendedor', '999-000-002', true),
  ('b2c3d4e5-f6a7-8901-bcde-fa2345678901', 'vendedor2@showroom.test','Carlos Ruiz',    'vendedor', '999-000-003', true),
  ('c3d4e5f6-a7b8-9012-cdef-ab3456789012', 'comprador1@showroom.test','Ana Torres',   'comprador','999-000-004', true),
  ('d4e5f6a7-b8c9-0123-defa-bc4567890123', 'comprador2@showroom.test','Jorge Mendoza','comprador','999-000-005', true),
  ('e5f6a7b8-c9d0-1234-efab-cd5678901234', 'comprador3@showroom.test','Lucía Fernández','comprador','999-000-006', true)
on conflict (id) do update set
  email    = excluded.email,
  nombre   = excluded.nombre,
  rol      = excluded.rol,
  telefono = excluded.telefono,
  activo   = excluded.activo,
  updated_at = now();

-- =============================================================================
-- 4. LOTES — Datos reales de Estructura_Precios_y_Base_Datos_Demo.xlsx
--    30 lotes: Mz.A (8), Mz.B (8), Mz.C (7), Mz.D (7)
--    Tarifas: Mz.A S/230.68/m², Mz.B S/215/m², Mz.C S/200/m², Mz.D S/200/m²
-- =============================================================================
insert into public.lotes (id, proyecto_id, codigo, area_total, frente, fondo, precio, moneda, estado, poligono_coords, imagen_plano, descripcion, orden)
values
  -- Mz. A — Frente a Carretera (Premium) S/230.68/m² — All 173.40 m² — S/40,000
  ('d1981b6a-a41c-48ed-bbcf-ac581b77c87c', '619882a9-4783-43b9-b902-74d10e491a70', 'Mz-A Lote 1',  173.40, 13.00, 13.34, 40000.00, 'PEN', 'vendido',    null, null, 'Lote 1, Mz. A — Frente a carretera (Premium)',  1),
  ('12aff3cb-997a-4f39-bc2a-d8e47d054f76', '619882a9-4783-43b9-b902-74d10e491a70', 'Mz-A Lote 2',  173.40, 13.00, 13.34, 40000.00, 'PEN', 'disponible', null, null, 'Lote 2, Mz. A — Frente a carretera (Premium)',  2),
  ('f7174812-27d0-4b27-bbcb-7000ccfb7027', '619882a9-4783-43b9-b902-74d10e491a70', 'Mz-A Lote 3',  173.40, 13.00, 13.34, 40000.00, 'PEN', 'disponible', null, null, 'Lote 3, Mz. A — Frente a carretera (Premium)',  3),
  ('d590dbd3-f71a-4682-8ac5-365507b3ae66', '619882a9-4783-43b9-b902-74d10e491a70', 'Mz-A Lote 4',  173.40, 13.00, 13.34, 40000.00, 'PEN', 'disponible', null, null, 'Lote 4, Mz. A — Frente a carretera (Premium)',  4),
  ('de4aaeb8-e361-4c1e-be4f-944b863f5a12', '619882a9-4783-43b9-b902-74d10e491a70', 'Mz-A Lote 5',  173.40, 13.00, 13.34, 40000.00, 'PEN', 'reservado',  null, null, 'Lote 5, Mz. A — Frente a carretera (Premium)',  5),
  ('519ce39b-b68f-4412-80bf-2d8c7ab0ab21', '619882a9-4783-43b9-b902-74d10e491a70', 'Mz-A Lote 6',  173.40, 13.00, 13.34, 40000.00, 'PEN', 'disponible', null, null, 'Lote 6, Mz. A — Frente a carretera (Premium)',  6),
  ('9c3d1bbf-7770-4e88-9054-d0b0a805aa30', '619882a9-4783-43b9-b902-74d10e491a70', 'Mz-A Lote 7',  173.40, 13.00, 13.34, 40000.00, 'PEN', 'vendido',    null, null, 'Lote 7, Mz. A — Frente a carretera (Premium)',  7),
  ('e2bfe285-d4ec-400d-9e24-6e92c2936c03', '619882a9-4783-43b9-b902-74d10e491a70', 'Mz-A Lote 8',  173.40, 13.00, 13.34, 40000.00, 'PEN', 'vendido',    null, null, 'Lote 8, Mz. A — Frente a carretera (Premium)',  8),

  -- Mz. B — Segunda Línea (Media-Alta) S/215/m²
  ('9ab99e4d-97ec-4cb9-a2cf-d3ffe98d6b58', '619882a9-4783-43b9-b902-74d10e491a70', 'Mz-B Lote 1',  204.40, 14.30, 14.30, 43946.00, 'PEN', 'disponible', null, null, 'Lote 1, Mz. B — Segunda línea (Media-Alta)',   9),
  ('ae4226da-dc60-4730-8588-f439834ac99c', '619882a9-4783-43b9-b902-74d10e491a70', 'Mz-B Lote 2',  202.60, 14.23, 14.24, 43559.00, 'PEN', 'disponible', null, null, 'Lote 2, Mz. B — Segunda línea (Media-Alta)',  10),
  ('66244adc-d063-4bd7-a14e-971f3850a515', '619882a9-4783-43b9-b902-74d10e491a70', 'Mz-B Lote 3',  200.80, 14.17, 14.17, 43172.00, 'PEN', 'reservado',  null, null, 'Lote 3, Mz. B — Segunda línea (Media-Alta)',  11),
  ('c8eabef0-1d4a-4bac-a84a-0ee175d7ca16', '619882a9-4783-43b9-b902-74d10e491a70', 'Mz-B Lote 4',  199.00, 14.11, 14.10, 42785.00, 'PEN', 'disponible', null, null, 'Lote 4, Mz. B — Segunda línea (Media-Alta)',  12),
  ('727a68ac-2da8-4262-8801-50aff38a8aaa', '619882a9-4783-43b9-b902-74d10e491a70', 'Mz-B Lote 5',  197.20, 14.04, 14.04, 42398.00, 'PEN', 'disponible', null, null, 'Lote 5, Mz. B — Segunda línea (Media-Alta)',  13),
  ('a5e878cc-e9a9-4a0d-a5b6-c137acd6bb02', '619882a9-4783-43b9-b902-74d10e491a70', 'Mz-B Lote 6',  195.50, 13.98, 13.98, 42033.00, 'PEN', 'vendido',    null, null, 'Lote 6, Mz. B — Segunda línea (Media-Alta)',  14),
  ('8f7ba206-bc5e-48ba-809f-deab1c8b14aa', '619882a9-4783-43b9-b902-74d10e491a70', 'Mz-B Lote 7',  193.70, 13.92, 13.91, 41646.00, 'PEN', 'disponible', null, null, 'Lote 7, Mz. B — Segunda línea (Media-Alta)',  15),
  ('86647d09-c64e-477a-a596-fb481b0c2702', '619882a9-4783-43b9-b902-74d10e491a70', 'Mz-B Lote 8',  191.90, 13.85, 13.85, 41259.00, 'PEN', 'disponible', null, null, 'Lote 8, Mz. B — Segunda línea (Media-Alta)',  16),

  -- Mz. C — Zona Interior (Estándar) S/200/m²
  ('460f6c57-263d-4710-bff8-5d085e493721', '619882a9-4783-43b9-b902-74d10e491a70', 'Mz-C Lote 1',  182.90, 13.52, 13.53, 36580.00, 'PEN', 'disponible', null, null, 'Lote 1, Mz. C — Zona interior (Estándar)',    17),
  ('90503b1e-e16d-4310-82f4-c6ad59b313f8', '619882a9-4783-43b9-b902-74d10e491a70', 'Mz-C Lote 2',  182.90, 13.52, 13.53, 36580.00, 'PEN', 'disponible', null, null, 'Lote 2, Mz. C — Zona interior (Estándar)',    18),
  ('a07880bf-7dc6-413b-97f4-94968fe542eb', '619882a9-4783-43b9-b902-74d10e491a70', 'Mz-C Lote 3',  182.90, 13.52, 13.53, 36580.00, 'PEN', 'disponible', null, null, 'Lote 3, Mz. C — Zona interior (Estándar)',    19),
  ('62e13fe3-6476-4e1c-bc92-a69214574b9a', '619882a9-4783-43b9-b902-74d10e491a70', 'Mz-C Lote 4',  183.00, 13.53, 13.53, 36600.00, 'PEN', 'reservado',  null, null, 'Lote 4, Mz. C — Zona interior (Estándar)',    20),
  ('a822f303-f60f-4b20-aa89-7586305b7dda', '619882a9-4783-43b9-b902-74d10e491a70', 'Mz-C Lote 5',  182.90, 13.52, 13.53, 36580.00, 'PEN', 'disponible', null, null, 'Lote 5, Mz. C — Zona interior (Estándar)',    21),
  ('ac26ab75-fb64-4700-9dba-cc235dd1dbbd', '619882a9-4783-43b9-b902-74d10e491a70', 'Mz-C Lote 6',  182.70, 13.51, 13.52, 36540.00, 'PEN', 'disponible', null, null, 'Lote 6, Mz. C — Zona interior (Estándar)',    22),
  ('b1729423-6de6-46fc-aae9-11fd22b49c4d', '619882a9-4783-43b9-b902-74d10e491a70', 'Mz-C Lote 7',  182.90, 13.52, 13.53, 36580.00, 'PEN', 'vendido',    null, null, 'Lote 7, Mz. C — Zona interior (Estándar)',    23),

  -- Mz. D — Zona Interior Lateral S/200/m²
  ('b6c82cee-946f-44d7-82c9-19e3589730e1', '619882a9-4783-43b9-b902-74d10e491a70', 'Mz-D Lote 1',  199.10, 14.11, 14.11, 39820.00, 'PEN', 'vendido',    null, null, 'Lote 1, Mz. D — Zona interior lateral',       24),
  ('d8291f17-e311-45b3-8967-55b1b58c906c', '619882a9-4783-43b9-b902-74d10e491a70', 'Mz-D Lote 2',  197.10, 14.04, 14.04, 39420.00, 'PEN', 'disponible', null, null, 'Lote 2, Mz. D — Zona interior lateral',       25),
  ('8a1db8b1-5585-4c56-95e8-9ccdd318459b', '619882a9-4783-43b9-b902-74d10e491a70', 'Mz-D Lote 3',  195.00, 13.96, 13.96, 39000.00, 'PEN', 'disponible', null, null, 'Lote 3, Mz. D — Zona interior lateral',       26),
  ('a0eeac68-272f-4cb3-a7be-00a4ec1029a4', '619882a9-4783-43b9-b902-74d10e491a70', 'Mz-D Lote 4',  193.20, 13.90, 13.90, 38640.00, 'PEN', 'disponible', null, null, 'Lote 4, Mz. D — Zona interior lateral',       27),
  ('f03857d0-cdad-4575-8602-c585e532fc6a', '619882a9-4783-43b9-b902-74d10e491a70', 'Mz-D Lote 5',  191.10, 13.82, 13.83, 38220.00, 'PEN', 'reservado',  null, null, 'Lote 5, Mz. D — Zona interior lateral',       28),
  ('122717e3-a440-4772-a3ea-57c1b7715b7d', '619882a9-4783-43b9-b902-74d10e491a70', 'Mz-D Lote 6',  189.20, 13.76, 13.76, 37840.00, 'PEN', 'disponible', null, null, 'Lote 6, Mz. D — Zona interior lateral',       29),
  ('20fd5828-29c6-4813-99be-9803f9a526a8', '619882a9-4783-43b9-b902-74d10e491a70', 'Mz-D Lote 7',  187.20, 13.68, 13.69, 37440.00, 'PEN', 'disponible', null, null, 'Lote 7, Mz. D — Zona interior lateral',       30)
on conflict (id) do update set
  proyecto_id      = excluded.proyecto_id,
  codigo           = excluded.codigo,
  area_total       = excluded.area_total,
  frente           = excluded.frente,
  fondo            = excluded.fondo,
  precio           = excluded.precio,
  moneda           = excluded.moneda,
  estado           = excluded.estado,
  poligono_coords  = excluded.poligono_coords,
  imagen_plano     = excluded.imagen_plano,
  descripcion      = excluded.descripcion,
  orden            = excluded.orden,
  updated_at       = now();

-- =============================================================================
-- 5. PERFILES (legacy)
-- =============================================================================
insert into public.perfiles (id, email, nombre, telefono, rol, agencia_id, activo)
values
  ('b9c65c2a-bbfb-475a-818f-67396fe63f01', 'admin@showroom.test',     'Admin Sistema',  '999-000-001', 'admin',    'd785bbc3-1cc0-4157-b47c-a2a3e0c2ad8c', true),
  ('1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'vendedor1@showroom.test', 'María López',    '999-000-002', 'agente',   'a3f1c2b4-5d6e-7f89-0a1b-2c3d4e5f6a7b', true),
  ('2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'vendedor2@showroom.test', 'Carlos Ruiz',    '999-000-003', 'agente',   'a3f1c2b4-5d6e-7f89-0a1b-2c3d4e5f6a7b', true),
  ('3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f', 'comprador1@showroom.test','Ana Torres',     '999-000-004', 'comprador', null,                               true),
  ('4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a', 'comprador2@showroom.test','Jorge Mendoza',  '999-000-005', 'comprador', null,                               true),
  ('5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b', 'comprador3@showroom.test','Lucía Fernández','999-000-006', 'comprador', null,                               true)
on conflict (id) do update set
  email        = excluded.email,
  nombre       = excluded.nombre,
  telefono     = excluded.telefono,
  rol          = excluded.rol,
  agencia_id   = excluded.agencia_id,
  activo       = excluded.activo,
  updated_at   = now();

-- =============================================================================
-- 6. PROPIEDADES (legacy) — Mapeado a lotos reales del Excel
-- =============================================================================
insert into public.propiedades (id, codigo, tipo, estado, precio, moneda, titulo, descripcion, area_m2, cuartos, banios, distrito, ciudad, ubicacion, svg_id, agencia_id, publicada, destacada)
values
  ('64f1e7f7-27b7-438b-afda-345698fef558', 'Mz-A Lote 1',  'lote',       'vendido',   40000.00, 'PEN', 'Mz-A Lote 1 - Urbanización Los Olivos',  'Lote 173.4m² frente a carretera (Premium).',  173.40, null, null, 'Santiago de Surco', 'Lima', point(-76.9961, -12.1364), 'mz-a-lote1', 'd785bbc3-1cc0-4157-b47c-a2a3e0c2ad8c', true,  true),
  ('65f1e7f7-27b7-438b-afda-345698fef559', 'Mz-A Lote 2',  'lote',       'disponible', 40000.00, 'PEN', 'Mz-A Lote 2 - Urbanización Los Olivos',  'Lote 173.4m² frente a carretera (Premium).',  173.40, null, null, 'Santiago de Surco', 'Lima', point(-76.9959, -12.1364), 'mz-a-lote2', 'd785bbc3-1cc0-4157-b47c-a2a3e0c2ad8c', true,  false),
  ('66f1e7f7-27b7-438b-afda-345698fef550', 'Mz-A Lote 5',  'lote',       'separado',  40000.00, 'PEN', 'Mz-A Lote 5 - Urbanización Los Olivos',  'Lote 173.4m² frente a carretera (Premium).',  173.40, null, null, 'Santiago de Surco', 'Lima', point(-76.9955, -12.1360), 'mz-a-lote5', 'd785bbc3-1cc0-4157-b47c-a2a3e0c2ad8c', true,  true),
  ('67f1e7f7-27b7-438b-afda-345698fef551', 'Mz-B Lote 6',  'lote',       'vendido',   42033.00, 'PEN', 'Mz-B Lote 6 - Urbanización Los Olivos',  'Lote 195.5m² segunda línea (Media-Alta).',     195.50, null, null, 'Santiago de Surco', 'Lima', point(-76.9957, -12.1356), 'mz-b-lote6', 'd785bbc3-1cc0-4157-b47c-a2a3e0c2ad8c', true,  false),
  ('68f1e7f7-27b7-438b-afda-345698fef552', 'Mz-C Lote 7',  'lote',       'vendido',   36580.00, 'PEN', 'Mz-C Lote 7 - Urbanización Los Olivos',  'Lote 182.9m² zona interior (Estándar).',       182.90, null, null, 'Santiago de Surco', 'Lima', point(-76.9948, -12.1368), 'mz-c-lote7', 'd785bbc3-1cc0-4157-b47c-a2a3e0c2ad8c', true,  false),
  ('69f1e7f7-27b7-438b-afda-345698fef553', 'Mz-D Lote 1',  'lote',       'vendido',   39820.00, 'PEN', 'Mz-D Lote 1 - Urbanización Los Olivos',  'Lote 199.1m² zona interior lateral.',          199.10, null, null, 'Santiago de Surco', 'Lima', point(-76.9940, -12.1350), 'mz-d-lote1', 'd785bbc3-1cc0-4157-b47c-a2a3e0c2ad8c', true,  true),
  ('6af1e7f7-27b7-438b-afda-345698fef554', 'Mz-B Lote 1',  'lote',       'disponible', 43946.00, 'PEN', 'Mz-B Lote 1 - Urbanización Los Olivos',  'Lote 204.4m² segunda línea (Media-Alta).',     204.40, null, null, 'Santiago de Surco', 'Lima', point(-76.9953, -12.1352), 'mz-b-lote1', 'd785bbc3-1cc0-4157-b47c-a2a3e0c2ad8c', true,  false),
  ('6bf1e7f7-27b7-438b-afda-345698fef555', 'Mz-C Lote 1',  'lote',       'disponible', 36580.00, 'PEN', 'Mz-C Lote 1 - Urbanización Los Olivos',  'Lote 182.9m² zona interior (Estándar).',       182.90, null, null, 'Santiago de Surco', 'Lima', point(-76.9945, -12.1362), 'mz-c-lote1', 'd785bbc3-1cc0-4157-b47c-a2a3e0c2ad8c', true,  false)
on conflict (id) do update set
  codigo      = excluded.codigo,
  tipo        = excluded.tipo,
  estado      = excluded.estado,
  precio      = excluded.precio,
  moneda      = excluded.moneda,
  titulo      = excluded.titulo,
  descripcion = excluded.descripcion,
  area_m2     = excluded.area_m2,
  cuartos     = excluded.cuartos,
  banios      = excluded.banios,
  distrito    = excluded.distrito,
  ciudad      = excluded.ciudad,
  ubicacion   = excluded.ubicacion,
  svg_id      = excluded.svg_id,
  agencia_id  = excluded.agencia_id,
  publicada   = excluded.publicada,
  destacada   = excluded.destacada,
  updated_at  = now();

-- =============================================================================
-- 6. LEADS (legacy)
-- =============================================================================
insert into public.leads (id, propiedad_id, nombre, email, telefono, score, estado, notas)
values
  ('1b95ac57-aea0-4e3f-8d82-b3f7bf2dda44', '64f1e7f7-27b7-438b-afda-345698fef558', 'Carlos Mendoza',  'carlos@test.com',  '999-111-111', 85, 'ganado',   'Compra definitiva Mz-A Lote 1.'),
  ('2b95ac57-aea0-4e3f-8d82-b3f7bf2dda45', '67f1e7f7-27b7-438b-afda-345698fef551', 'Ana Torres',      'ana@test.com',     '999-222-222', 70, 'contactado','Espera aprobación de crédito para Mz-B Lote 6.'),
  ('3b95ac57-aea0-4e3f-8d82-b3f7bf2dda46', '66f1e7f7-27b7-438b-afda-345698fef550', 'Pedro Gómez',     'pedro@test.com',   '999-333-333', 60, 'nuevo',     'Consultó por Mz-A Lote 5 (reservado).'),
  ('4b95ac57-aea0-4e3f-8d82-b3f7bf2dda47', '69f1e7f7-27b7-438b-afda-345698fef553', 'Rosa Delgado',    'rosa@test.com',    '999-444-444', 45, 'nuevo',     'Primer contacto por web, interesada en Mz-D.'),
  ('5b95ac57-aea0-4e3f-8d82-b3f7bf2dda48', '6af1e7f7-27b7-438b-afda-345698fef554', 'Miguel Soto',     'miguel@test.com',  '999-555-555', 90, 'calificado','Cliente VIP, busca lote en Mz-B.')
on conflict (id) do update set
  propiedad_id = excluded.propiedad_id,
  nombre       = excluded.nombre,
  email        = excluded.email,
  telefono     = excluded.telefono,
  score        = excluded.score,
  estado       = excluded.estado,
  notas        = excluded.notas,
  updated_at   = now();

-- =============================================================================
-- 7. MÉTRICAS_CLICKS (legacy)
-- =============================================================================
insert into public.metricas_clicks (propiedad_id, tipo_evento, sesion_id, pagina_origen)
values
  ('64f1e7f7-27b7-438b-afda-345698fef558', 'click',        's-001', '/propiedades/mz-a-lote1'),
  ('64f1e7f7-27b7-438b-afda-345698fef558', 'vista_detalle','s-001', '/propiedades/mz-a-lote1'),
  ('64f1e7f7-27b7-438b-afda-345698fef558', 'favorito',     's-001', '/propiedades/mz-a-lote1'),
  ('65f1e7f7-27b7-438b-afda-345698fef559', 'click',        's-002', '/propiedades/mz-a-lote2'),
  ('65f1e7f7-27b7-438b-afda-345698fef559', 'contacto',     's-002', '/propiedades/mz-a-lote2'),
  ('66f1e7f7-27b7-438b-afda-345698fef550', 'click',        's-003', '/propiedades/mz-a-lote5'),
  ('67f1e7f7-27b7-438b-afda-345698fef551', 'vista_detalle','s-004', '/propiedades/mz-b-lote6'),
  ('68f1e7f7-27b7-438b-afda-345698fef552', 'click',        's-005', '/propiedades/mz-c-lote7'),
  ('68f1e7f7-27b7-438b-afda-345698fef552', 'favorito',     's-005', '/propiedades/mz-c-lote7'),
  ('69f1e7f7-27b7-438b-afda-345698fef553', 'click',        's-006', '/propiedades/mz-d-lote1'),
  ('6af1e7f7-27b7-438b-afda-345698fef554', 'vista_detalle','s-007', '/propiedades/mz-b-lote1'),
  ('6bf1e7f7-27b7-438b-afda-345698fef555', 'click',        's-008', '/propiedades/mz-c-lote1')
;

-- =============================================================================
-- 8. TRANSACCIONES (lotización) — 6 ventas + 4 reservas
-- =============================================================================
insert into public.transacciones (id, lote_id, tipo, comprador_nombre, comprador_documento, comprador_email, comprador_telefono, monto, moneda, id_vendedor, notas)
values
  -- Ventas completadas
  ('4eed196f-5f34-41ed-9145-6aa9fc55da61', 'd1981b6a-a41c-48ed-bbcf-ac581b77c87c', 'venta',   'Carlos Mendoza', 'DNI-87654321', 'carlos@test.com',  '999-111-111', 40000.00, 'PEN', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Venta directa Mz-A Lote 1, pago completo.'),
  ('4eed196f-5f34-41ed-9145-6aa9fc55da64', '9c3d1bbf-7770-4e88-9054-d0b0a805aa30', 'venta',   'Lucía Fernández','DNI-11223344', 'lucia@test.com',   '999-222-222', 40000.00, 'PEN', 'b2c3d4e5-f6a7-8901-bcde-fa2345678901', 'Venta Mz-A Lote 7, crédito aprobado.'),
  ('4eed196f-5f34-41ed-9145-6aa9fc55da65', 'e2bfe285-d4ec-400d-9e24-6e92c2936c03', 'venta',   'Jorge Paredes',  'DNI-55667788', 'jorge@test.com',   '999-333-333', 40000.00, 'PEN', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Venta Mz-A Lote 8, pago contado.'),
  ('4eed196f-5f34-41ed-9145-6aa9fc55da66', 'a5e878cc-e9a9-4a0d-a5b6-c137acd6bb02', 'venta',   'Luis Castillo',  'DNI-99887766', 'luis@test.com',    '999-444-444', 42033.00, 'PEN', 'b2c3d4e5-f6a7-8901-bcde-fa2345678901', 'Venta Mz-B Lote 6, entrega sep 2026.'),
  ('4eed196f-5f34-41ed-9145-6aa9fc55da67', 'b1729423-6de6-46fc-aae9-11fd22b49c4d', 'venta',   'Sandra Ramos',   'DNI-44332211', 'sandra@test.com',  '999-555-555', 36580.00, 'PEN', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Venta Mz-C Lote 7, pago completo.'),
  ('4eed196f-5f34-41ed-9145-6aa9fc55da68', 'b6c82cee-946f-44d7-82c9-19e3589730e1', 'venta',   'María Fernández','DNI-66778899', 'maria@test.com',   '999-666-666', 39820.00, 'PEN', 'b2c3d4e5-f6a7-8901-bcde-fa2345678901', 'Venta Mz-D Lote 1, crédito hipotecario.'),

  -- Reservas (señas)
  ('5eed196f-5f34-41ed-9145-6aa9fc55da62', 'de4aaeb8-e361-4c1e-be4f-944b863f5a12', 'reserva', 'Ana Torres',      'DNI-12345678', 'ana@test.com',     '999-777-777',  5000.00, 'PEN', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Seña reserva Mz-A Lote 5, 48h para firma.'),
  ('5eed196f-5f34-41ed-9145-6aa9fc55da69', '66244adc-d063-4bd7-a14e-971f3850a515', 'reserva', 'Miguel Soto',     'DNI-23456789', 'miguel@test.com',  '999-888-888',  5000.00, 'PEN', 'b2c3d4e5-f6a7-8901-bcde-fa2345678901', 'Seña reserva Mz-B Lote 3, revisando financiamiento.'),
  ('5eed196f-5f34-41ed-9145-6aa9fc55da70', '62e13fe3-6476-4e1c-bc92-a69214574b9a', 'reserva', 'Pedro Gómez',     'DNI-34567890', 'pedro@test.com',   '999-999-999',  5000.00, 'PEN', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Seña reserva Mz-C Lote 4, espera aprobación.'),
  ('5eed196f-5f34-41ed-9145-6aa9fc55da71', 'f03857d0-cdad-4575-8602-c585e532fc6a', 'reserva', 'Rosa Delgado',    'DNI-45678901', 'rosa@test.com',    '999-000-000',  5000.00, 'PEN', 'b2c3d4e5-f6a7-8901-bcde-fa2345678901', 'Seña reserva Mz-D Lote 5, firma pendiente.')
on conflict (id) do update set
  lote_id            = excluded.lote_id,
  tipo               = excluded.tipo,
  comprador_nombre   = excluded.comprador_nombre,
  comprador_documento= excluded.comprador_documento,
  comprador_email    = excluded.comprador_email,
  comprador_telefono = excluded.comprador_telefono,
  monto              = excluded.monto,
  moneda             = excluded.moneda,
  id_vendedor        = excluded.id_vendedor,
  notas              = excluded.notas,
  updated_at         = now();

-- =============================================================================
-- 9. TOURS 360 (Virtual Tours)
-- =============================================================================
-- All scene IDs and escena_inicial_id MUST be valid UUIDs
insert into public.tours_360 (id, proyecto_id, nombre, descripcion, escenas, escena_inicial_id, metadatos, estado)
values
  -- Tour 1: Urbanización Los Olivos (3 escenas)
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567899',
    '619882a9-4783-43b9-b902-74d10e491a70',
    'Tour 360° - Urbanización Los Olivos',
    'Recorrido virtual interactivo por la entrada principal y áreas comunes',
    '[
      {
        "id": "11111111-1111-1111-1111-111111111101",
        "textureUrl": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=4000&h=2000&fit=crop",
        "thumbnailUrl": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        "yaw": 0, "pitch": 0, "fov": 90,
        "panoramaCenter": {"lat": -12.1360, "lng": -76.9960}
      },
      {
        "id": "11111111-1111-1111-1111-111111111102",
        "textureUrl": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=4000&h=2000&fit=crop",
        "thumbnailUrl": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop",
        "yaw": 45, "pitch": 5, "fov": 100,
        "panoramaCenter": {"lat": -12.1355, "lng": -76.9955}
      },
      {
        "id": "11111111-1111-1111-1111-111111111103",
        "textureUrl": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=4000&h=2000&fit=crop",
        "thumbnailUrl": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop",
        "yaw": -30, "pitch": -2, "fov": 85,
        "panoramaCenter": {"lat": -12.1364, "lng": -76.9961}
      }
    ]',
    '11111111-1111-1111-1111-111111111101',
    '{"author": "Sistema Demo", "version": "1.0", "captureDate": "2024-01-15", "cameraModel": "Insta360 Pro 2"}',
    'publicado'
  ),
  -- Tour 2: Residencial San Felipe (3 escenas)
  (
    'b2c3d4e5-f6a7-8901-bcde-fa2345678900',
    '7c8d9e0f-1a2b-4c3d-4e5f-6a7b8c9d0e1f',
    'Tour 360° - Residencial San Felipe',
    'Tour virtual de la casa modelo con vista interior',
    '[
      {
        "id": "22222222-2222-2222-2222-222222222201",
        "textureUrl": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=4000&h=2000&fit=crop",
        "thumbnailUrl": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
        "yaw": 0, "pitch": 0, "fov": 90,
        "panoramaCenter": {"lat": -12.1150, "lng": -77.0300}
      },
      {
        "id": "22222222-2222-2222-2222-222222222202",
        "textureUrl": "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=4000&h=2000&fit=crop",
        "thumbnailUrl": "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&h=300&fit=crop",
        "yaw": 180, "pitch": 0, "fov": 80,
        "panoramaCenter": {"lat": -12.1150, "lng": -77.0300}
      },
      {
        "id": "22222222-2222-2222-2222-222222222203",
        "textureUrl": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=4000&h=2000&fit=crop",
        "thumbnailUrl": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop",
        "yaw": 90, "pitch": -5, "fov": 100,
        "panoramaCenter": {"lat": -12.1148, "lng": -77.0298}
      }
    ]',
    '22222222-2222-2222-2222-222222222201',
    '{"author": "Sistema Demo", "version": "1.0", "captureDate": "2024-02-20", "cameraModel": "GoPro MAX"}',
    'publicado'
  ),
  -- Tour 3: Torres del Sur (3 escenas)
  (
    'c3d4e5f6-a7b8-9012-cdef-ab3456789001',
    '9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d',
    'Tour 360° - Torres del Sur (Departamento Modelo)',
    'Tour virtual del departamento 301 con vista al mar',
    '[
      {
        "id": "33333333-3333-3333-3333-333333333301",
        "textureUrl": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=4000&h=2000&fit=crop",
        "thumbnailUrl": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop",
        "yaw": 0, "pitch": 0, "fov": 90,
        "panoramaCenter": {"lat": -12.2200, "lng": -76.9700}
      },
      {
        "id": "33333333-3333-3333-3333-333333333302",
        "textureUrl": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=4000&h=2000&fit=crop",
        "thumbnailUrl": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop",
        "yaw": 120, "pitch": 0, "fov": 85,
        "panoramaCenter": {"lat": -12.2205, "lng": -76.9710}
      },
      {
        "id": "33333333-3333-3333-3333-333333333303",
        "textureUrl": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=4000&h=2000&fit=crop",
        "thumbnailUrl": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop",
        "yaw": 270, "pitch": 10, "fov": 120,
        "panoramaCenter": {"lat": -12.2195, "lng": -76.9700}
      }
    ]',
    '33333333-3333-3333-3333-333333333301',
    '{"author": "Sistema Demo", "version": "1.0", "captureDate": "2024-03-10", "cameraModel": "Ricoh Theta Z1"}',
    'publicado'
  ),
  -- Tour 4: Lote Mz-B Lote 2 (2 escenas, borrador)
  (
    'd4e5f6a7-b8c9-0123-defa-bc4567899002',
    '619882a9-4783-43b9-b902-74d10e491a70',
    'Tour 360° - Mz-B Lote 2',
    'Tour virtual del lote disponible Mz-B Lote 2',
    '[
      {
        "id": "44444444-4444-4444-4444-444444444401",
        "textureUrl": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=4000&h=2000&fit=crop",
        "thumbnailUrl": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop",
        "yaw": 0, "pitch": 0, "fov": 90,
        "panoramaCenter": {"lat": -12.1348, "lng": -76.9957}
      },
      {
        "id": "44444444-4444-4444-4444-444444444402",
        "textureUrl": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=4000&h=2000&fit=crop&q=80",
        "thumbnailUrl": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop&q=80",
        "yaw": 180, "pitch": 0, "fov": 85,
        "panoramaCenter": {"lat": -12.1348, "lng": -76.9959}
      }
    ]',
    '44444444-4444-4444-4444-444444444401',
    '{"author": "Sistema Demo", "version": "1.0", "captureDate": "2024-04-05", "cameraModel": "Insta360 X3"}',
    'borrador'
  )
on conflict (id) do update set
  proyecto_id     = excluded.proyecto_id,
  nombre          = excluded.nombre,
  descripcion     = excluded.descripcion,
  escenas         = excluded.escenas,
  escena_inicial_id = excluded.escena_inicial_id,
  metadatos       = excluded.metadatos,
  estado          = excluded.estado,
  updated_at      = now();

-- =============================================================================
-- 10. TOUR POIs (Points of Interest) — all IDs must be UUIDs
-- =============================================================================
insert into public.tour_pois (id, tour_id, name, description, poi_type, icon, lat, lng, metadata)
values
  -- POIs for Urbanización Los Olivos tour
  ('aaaa0001-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567899', 'Parque Infantil',         'Área de juegos para niños con césped sintético',     'amenity',  '🎠', -12.1355, -76.9965, '{"hours": "6:00 - 22:00", "capacity": 20}'),
  ('aaaa0001-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567899', 'Pista de Correr',         'Ciclovía de 500m alrededor del proyecto',           'amenity',  '🏃', -12.1358, -76.9962, '{"length_meters": 500, "lit": true}'),
  ('aaaa0001-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567899', 'Salón de Eventos',        'Salón multiuso para reuniones y celebraciones',     'amenity',  '🎪', -12.1360, -76.9968, '{"area_m2": 80, "capacity": 50}'),
  ('aaaa0001-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567899', 'Comisaría Vecinal',       'Punto de control de seguridad 24/7',                'landmark', '🚓', -12.1362, -76.9970, '{"security_hours": "24/7"}'),
  ('aaaa0001-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567899', 'Mz-A Lote 2',             'Lote disponible 173.4m² — S/40,000',              'amenity',  '🏠', -12.1364, -76.9959, '{"lote_id": "12aff3cb-997a-4f39-bc2a-d8e47d054f76", "status": "disponible", "price_pen": 40000}'),
  ('aaaa0001-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567899', 'Mz-A Lote 3',             'Lote disponible 173.4m² — S/40,000',              'amenity',  '🏡', -12.1364, -76.9957, '{"lote_id": "f7174812-27d0-4b27-bbcb-7000ccfb7027", "status": "disponible", "price_pen": 40000}'),
  -- POIs for Residencial San Felipe tour
  ('aaaa0002-0000-0000-0000-000000000001', 'b2c3d4e5-f6a7-8901-bcde-fa2345678900', 'Iglesia San Felipe',      'Monumento histórico del siglo XIX',                'landmark', '⛪', -12.1152, -77.0305, '{"year_built": 1850, "heritage": true}'),
  ('aaaa0002-0000-0000-0000-000000000002', 'b2c3d4e5-f6a7-8901-bcde-fa2345678900', 'Parque Jesús María',      'Parque central con cancha deportiva',              'amenity',  '🌳', -12.1148, -77.0302, '{"area_m2": 2500, "sports_court": true}'),
  ('aaaa0002-0000-0000-0000-000000000003', 'b2c3d4e5-f6a7-8901-bcde-fa2345678900', 'Casa Modelo',             'Casa de 2 pisos con jardín — 220m²',              'attraction','🏡', -12.1150, -77.0300, '{"status": "disponible", "price_pen": 185000}'),
  -- POIs for Torres del Sur tour
  ('aaaa0003-0000-0000-0000-000000000001', 'c3d4e5f6-a7b8-9012-cdef-ab3456789001', 'Vista al Mar',            'Mirador con vista a la bahía',                    'attraction','🌅', -12.2195, -76.9700, '{"view_type": "ocean", "best_time": "atardecer"}'),
  ('aaaa0003-0000-0000-0000-000000000002', 'c3d4e5f6-a7b8-9012-cdef-ab3456789001', 'Gimnasio',                'Gimnasio equipado con máquinas cardio',            'amenity',  '💪', -12.2202, -76.9698, '{"equipment": ["treadmills", "bikes", "weights"], "hours": "6:00-22:00"}'),
  ('aaaa0003-0000-0000-0000-000000000003', 'c3d4e5f6-a7b8-9012-cdef-ab3456789001', 'Lobby Principal',         'Recepción con conserjería 24/7',                  'amenity',  '🏢', -12.2200, -76.9705, '{"concierge": true, "security": true}')
on conflict (id) do update set
  tour_id    = excluded.tour_id,
  name       = excluded.name,
  description = excluded.description,
  poi_type   = excluded.poi_type,
  icon       = excluded.icon,
  lat        = excluded.lat,
  lng        = excluded.lng,
  metadata   = excluded.metadata,
  updated_at = now();

-- =============================================================================
-- 11. ANALYTICS EVENTS (Tour Tracking) — all IDs must be UUIDs
-- =============================================================================
insert into public.analytics_events (id, event_type, tour_id, parcel_id, visitor_id, metadata)
values
  -- Los Olivos tour: visitors
  ('bbbb0001-0000-0000-0000-000000000001', 'tour_start',    'a1b2c3d4-e5f6-7890-abcd-ef1234567899', null,                                           'visitor-001', '{"device": "desktop", "browser": "Chrome", "os": "Windows"}'),
  ('bbbb0001-0000-0000-0000-000000000002', 'tour_end',      'a1b2c3d4-e5f6-7890-abcd-ef1234567899', null,                                           'visitor-001', '{"duration_seconds": 180, "scenes_viewed": 3}'),
  ('bbbb0001-0000-0000-0000-000000000003', 'tour_start',    'a1b2c3d4-e5f6-7890-abcd-ef1234567899', null,                                           'visitor-002', '{"device": "mobile", "browser": "Safari", "os": "iOS"}'),
  ('bbbb0001-0000-0000-0000-000000000004', 'tour_end',      'a1b2c3d4-e5f6-7890-abcd-ef1234567899', null,                                           'visitor-002', '{"duration_seconds": 240, "scenes_viewed": 3}'),
  -- Parcel clicks
  ('bbbb0001-0000-0000-0000-000000000005', 'parcel_click',  'a1b2c3d4-e5f6-7890-abcd-ef1234567899', '12aff3cb-997a-4f39-bc2a-d8e47d054f76',          'visitor-001', '{"scene_id": "11111111-1111-1111-1111-111111111103", "click_position_x": 0.65, "click_position_y": 0.32}'),
  ('bbbb0001-0000-0000-0000-000000000006', 'parcel_click',  'a1b2c3d4-e5f6-7890-abcd-ef1234567899', 'f7174812-27d0-4b27-bbcb-7000ccfb7027',          'visitor-002', '{"scene_id": "11111111-1111-1111-1111-111111111101", "click_position_x": 0.45, "click_position_y": 0.55}'),
  ('bbbb0001-0000-0000-0000-000000000007', 'parcel_click',  'a1b2c3d4-e5f6-7890-abcd-ef1234567899', '12aff3cb-997a-4f39-bc2a-d8e47d054f76',          'visitor-003', '{"scene_id": "11111111-1111-1111-1111-111111111101", "click_position_x": 0.70, "click_position_y": 0.40}'),
  -- WhatsApp clicks
  ('bbbb0001-0000-0000-0000-000000000009', 'whatsapp_click', 'a1b2c3d4-e5f6-7890-abcd-ef1234567899', '12aff3cb-997a-4f39-bc2a-d8e47d054f76',          'visitor-001', '{"scene_id": "11111111-1111-1111-1111-111111111103"}'),
  ('bbbb0001-0000-0000-0000-000000000010', 'whatsapp_click', 'a1b2c3d4-e5f6-7890-abcd-ef1234567899', 'f7174812-27d0-4b27-bbcb-7000ccfb7027',          'visitor-002', '{"scene_id": "11111111-1111-1111-1111-111111111101"}'),
  -- Share clicks
  ('bbbb0001-0000-0000-0000-000000000011', 'share_click',   'a1b2c3d4-e5f6-7890-abcd-ef1234567899', null,                                           'visitor-001', '{"method": "facebook"}'),
  ('bbbb0001-0000-0000-0000-000000000012', 'share_click',   'a1b2c3d4-e5f6-7890-abcd-ef1234567899', null,                                           'visitor-003', '{"method": "whatsapp"}'),

  -- San Felipe tour
  ('bbbb0002-0000-0000-0000-000000000001', 'tour_start',    'b2c3d4e5-f6a7-8901-bcde-fa2345678900', null,                                           'visitor-004', '{"device": "desktop", "browser": "Firefox", "os": "Linux"}'),
  ('bbbb0002-0000-0000-0000-000000000002', 'tour_end',      'b2c3d4e5-f6a7-8901-bcde-fa2345678900', null,                                           'visitor-004', '{"duration_seconds": 320, "scenes_viewed": 3}'),
  ('bbbb0002-0000-0000-0000-000000000004', 'whatsapp_click', 'b2c3d4e5-f6a7-8901-bcde-fa2345678900', null,                                           'visitor-005', '{"scene_id": "22222222-2222-2222-2222-222222222202"}'),
  ('bbbb0002-0000-0000-0000-000000000005', 'share_click',   'b2c3d4e5-f6a7-8901-bcde-fa2345678900', null,                                           'visitor-004', '{"method": "copy_link"}'),

  -- Torres del Sur tour
  ('bbbb0003-0000-0000-0000-000000000001', 'tour_start',    'c3d4e5f6-a7b8-9012-cdef-ab3456789001', null,                                           'visitor-005', '{"device": "mobile", "browser": "Chrome", "os": "Android"}'),
  ('bbbb0003-0000-0000-0000-000000000002', 'tour_end',      'c3d4e5f6-a7b8-9012-cdef-ab3456789001', null,                                           'visitor-005', '{"duration_seconds": 150, "scenes_viewed": 2}'),
  ('bbbb0003-0000-0000-0000-000000000003', 'tour_start',    'c3d4e5f6-a7b8-9012-cdef-ab3456789001', null,                                           'visitor-006', '{"device": "desktop", "browser": "Edge", "os": "Windows"}'),
  ('bbbb0003-0000-0000-0000-000000000004', 'tour_end',      'c3d4e5f6-a7b8-9012-cdef-ab3456789001', null,                                           'visitor-006', '{"duration_seconds": 200, "scenes_viewed": 3}'),
  ('bbbb0003-0000-0000-0000-000000000005', 'parcel_click',  'c3d4e5f6-a7b8-9012-cdef-ab3456789001', 'c3d4e5f6-a7b8-9012-cdef-ab3456789015',          'visitor-005', '{"scene_id": "33333333-3333-3333-3333-333333333302"}'),
  ('bbbb0003-0000-0000-0000-000000000007', 'whatsapp_click', 'c3d4e5f6-a7b8-9012-cdef-ab3456789001', 'c3d4e5f6-a7b8-9012-cdef-ab3456789015',          'visitor-005', '{"scene_id": "33333333-3333-3333-3333-333333333301"}'),
  ('bbbb0003-0000-0000-0000-000000000008', 'share_click',   'c3d4e5f6-a7b8-9012-cdef-ab3456789001', null,                                           'visitor-006', '{"method": "email"}')
on conflict (id) do update set
  event_type = excluded.event_type,
  tour_id    = excluded.tour_id,
  parcel_id  = excluded.parcel_id,
  visitor_id = excluded.visitor_id,
  metadata   = excluded.metadata;

-- =============================================================================
-- FIN SEED
-- =============================================================================
