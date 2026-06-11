-- =============================================================================
-- SHOWROOM DIGITAL INMOBILIARIO — Seed completo de datos de prueba (UUIDs válidos)
-- =============================================================================
-- Idempotente: usa ON CONFLICT DO UPDATE
-- UUIDs generados: formato estándar 8-4-4-4-12
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
  ('619882a9-4783-43b9-b902-74d10e491a70', 'Urbanización Los Olivos', 'Proyecto residencial en Surco, Lima.',        'Av. Los Olivos 100, Santiago de Surco', '{"lat": -12.1360, "lng": -76.9960}', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=400&fit=crop', true),
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
-- 4. LOTES
-- =============================================================================
insert into public.lotes (id, proyecto_id, codigo, area_total, frente, fondo, precio, moneda, estado, poligono_coords, imagen_plano, descripcion, orden)
values
  -- Proyecto 1: Urbanización Los Olivos
  ('b7b0dee1-b948-4303-ab91-3b0fc41ffa17', '619882a9-4783-43b9-b902-74d10e491a70', 'MZ-A LT-01', 120.00, 6.00, 20.00, 85000.00,  'PEN', 'disponible', '{"type":"Polygon","coordinates":[[[-76.9961,-12.1364],[-76.9959,-12.1364],[-76.9959,-12.1356],[-76.9961,-12.1356],[-76.9961,-12.1364]]]}', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop', 'Lote esquina, ideal para casa de 3 pisos.', 1),
  ('c3d4e5f6-a7b8-9012-cdef-ab3456789013', '619882a9-4783-43b9-b902-74d10e491a70', 'MZ-A LT-02', 100.00, 5.00, 20.00, 72000.00,  'PEN', 'disponible', '{"type":"Polygon","coordinates":[[[-76.9959,-12.1364],[-76.9957,-12.1364],[-76.9957,-12.1356],[-76.9959,-12.1356],[-76.9959,-12.1364]]]}', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop', 'Frente a parque.', 2),
  ('d4e5f6a7-b8c9-0123-defa-bc4567899014', '619882a9-4783-43b9-b902-74d10e491a70', 'MZ-A LT-03', 150.00, 7.50, 20.00, 95000.00,  'PEN', 'reservado',  '{"type":"Polygon","coordinates":[[[-76.9957,-12.1364],[-76.9954,-12.1364],[-76.9954,-12.1356],[-76.9957,-12.1356],[-76.9957,-12.1364]]]}', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop', 'Con vista panorámica.', 3),
  ('e5f6a7b8-c9d0-1234-efab-cd5678901235', '619882a9-4783-43b9-b902-74d10e491a70', 'MZ-B LT-01', 180.00, 8.00, 22.50, 120000.00, 'PEN', 'disponible', '{"type":"Polygon","coordinates":[[[-76.9961,-12.1356],[-76.9959,-12.1356],[-76.9959,-12.1348],[-76.9961,-12.1348],[-76.9961,-12.1356]]]}', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop', 'Esquina doble frente.', 4),
  ('f6a7b8c9-d0e1-2345-fabc-de6789012346', '619882a9-4783-43b9-b902-74d10e491a70', 'MZ-B LT-02', 200.00, 10.00, 20.00, 150000.00,'PEN', 'vendido',    '{"type":"Polygon","coordinates":[[[-76.9959,-12.1356],[-76.9957,-12.1356],[-76.9957,-12.1348],[-76.9959,-12.1348],[-76.9959,-12.1356]]]}', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop', 'Vendido a comprador particular.', 5),

  -- Proyecto 2: Residencial San Felipe
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567891', '7c8d9e0f-1a2b-4c3d-4e5f-6a7b8c9d0e1f', 'CASA-01', 220.00, 11.00, 20.00, 185000.00, 'PEN', 'disponible', '{"type":"Polygon","coordinates":[[[-77.0305,-12.1155],[-77.0295,-12.1155],[-77.0295,-12.1145],[-77.0305,-12.1145],[-77.0305,-12.1155]]]}', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop', 'Casa de 3 pisos con jardín.', 1),
  ('b2c3d4e5-f6a7-8901-bcde-fa2345678902', '7c8d9e0f-1a2b-4c3d-4e5f-6a7b8c9d0e1f', 'CASA-02', 250.00, 12.00, 20.83, 210000.00, 'PEN', 'reservado',  '{"type":"Polygon","coordinates":[[[-77.0295,-12.1155],[-77.0285,-12.1155],[-77.0285,-12.1145],[-77.0295,-12.1145],[-77.0295,-12.1155]]]}', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop', 'Reservada para familia García.', 2),

  -- Proyecto 3: Torres del Sur
  ('c3d4e5f6-a7b8-9012-cdef-ab3456789015', '9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d', 'DEPT-301', 65.00,  7.00,  9.29,  95000.00,  'PEN', 'disponible', '{"type":"Polygon","coordinates":[[[-76.9710,-12.2205],[-76.9700,-12.2205],[-76.9700,-12.2195],[-76.9710,-12.2195],[-76.9710,-12.2205]]]}', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop', 'Dpto 3er piso, 2 dormitorios.', 1),
  ('d4e5f6a7-b8c9-0123-defa-bc4567899016', '9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d', 'DEPT-302', 75.00,  8.00,  9.38,  115000.00, 'PEN', 'vendido',    '{"type":"Polygon","coordinates":[[[-76.9700,-12.2205],[-76.9689,-12.2205],[-76.9689,-12.2195],[-76.9700,-12.2195],[-76.9700,-12.2205]]]}', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop', 'Vendido — entrega dic 2026.', 2)
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
-- 6. PROPIEDADES (legacy)
-- =============================================================================
insert into public.propiedades (id, codigo, tipo, estado, precio, moneda, titulo, descripcion, area_m2, cuartos, banios, distrito, ciudad, ubicacion, svg_id, agencia_id, publicada, destacada)
values
  ('64f1e7f7-27b7-438b-afda-345698fef558', 'LOTE-A01', 'lote',       'disponible', 85000.00,  'PEN', 'Lote A-01 - Urbanización Los Olivos', 'Terreno esquinero de 120m².', 120.00, null, null, 'Santiago de Surco', 'Lima', point(-76.9967, -12.1354), 'lote-a01', 'd785bbc3-1cc0-4157-b47c-a2a3e0c2ad8c', true,  true),
  ('65f1e7f7-27b7-438b-afda-345698fef559', 'LOTE-A02', 'lote',       'disponible', 72000.00,  'PEN', 'Lote A-02 - Urbanización Los Olivos', 'Lote de 100m² frente a parque.', 100.00, null, null, 'Santiago de Surco', 'Lima', point(-76.9955, -12.1360), 'lote-a02', 'd785bbc3-1cc0-4157-b47c-a2a3e0c2ad8c', true,  false),
  ('66f1e7f7-27b7-438b-afda-345698fef550', 'LOTE-A03', 'lote',       'separado',   95000.00,  'PEN', 'Lote A-03 - Urbanización Los Olivos', 'Lote de 150m² con vista panorámica.', 150.00, null, null, 'Santiago de Surco', 'Lima', point(-76.9948, -12.1368), 'lote-a03', 'd785bbc3-1cc0-4157-b47c-a2a3e0c2ad8c', true,  true),
  ('67f1e7f7-27b7-438b-afda-345698fef551', 'DEPT-101', 'departamento','vendido',   180000.00, 'PEN', 'Departamento 101 - Edificio Central', 'Departamento 80m², 3 dorm.', 80.00, 3, 2, 'Miraflores', 'Lima', point(-77.0282, -12.1220), 'dept-101', 'd785bbc3-1cc0-4157-b47c-a2a3e0c2ad8c', true,  false),
  ('68f1e7f7-27b7-438b-afda-345698fef552', 'DEPT-102', 'departamento','disponible', 195000.00, 'PEN', 'Departamento 102 - Edificio Central', 'Departamento 90m², 3 dorm, balcón.', 90.00, 3, 2, 'Miraflores', 'Lima', point(-77.0278, -12.1215), 'dept-102', 'd785bbc3-1cc0-4157-b47c-a2a3e0c2ad8c', true,  true),
  ('69f1e7f7-27b7-438b-afda-345698fef553', 'CASA-01',  'casa',        'disponible', 250000.00, 'PEN', 'Casa 01 - Residencial San Felipe', 'Casa de 2 pisos, 200m².', 200.00, 3, 2, 'Jesús María', 'Lima', point(-77.0310, -12.1145), 'casa-01', 'a3f1c2b4-5d6e-7f89-0a1b-2c3d4e5f6a7b', true,  true),
  ('6af1e7f7-27b7-438b-afda-345698fef554', 'OFIC-01',  'oficina',     'disponible', 120000.00, 'USD','Oficina 01 - Torre Empresarial', 'Oficina 50m² en piso 10.', 50.00, 1, 1, 'San Isidro', 'Lima', point(-77.0350, -12.1100), 'ofic-01', 'b7e8f9a0-1b2c-3d4e-5f6a-7b8c9d0e1f2a', true,  false),
  ('6bf1e7f7-27b7-438b-afda-345698fef555', 'LOCAL-01', 'local',       'vendido',    95000.00,  'PEN', 'Local 01 - Galería Comercial', 'Local 40m² en primer piso.', 40.00, 1, 1, 'La Victoria', 'Lima', point(-77.0250, -12.1180), 'local-01','b7e8f9a0-1b2c-3d4e-5f6a-7b8c9d0e1f2a', true, false)
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
-- 7. LEADS (legacy)
-- =============================================================================
insert into public.leads (id, propiedad_id, nombre, email, telefono, score, estado, notas)
values
  ('1b95ac57-aea0-4e3f-8d82-b3f7bf2dda44', '67f1e7f7-27b7-438b-afda-345698fef551', 'Ana Torres',     'ana@test.com',   '999-111-111', 85, 'ganado',   'Compra definitiva.'),
  ('2b95ac57-aea0-4e3f-8d82-b3f7bf2dda45', '68f1e7f7-27b7-438b-afda-345698fef552', 'Jorge Mendoza',  'jorge@test.com', '999-222-222', 70, 'contactado','Espera aprobación de crédito.'),
  ('3b95ac57-aea0-4e3f-8d82-b3f7bf2dda46', '64f1e7f7-27b7-438b-afda-345698fef558', 'Ana Torres',     'ana@test.com',   '999-111-111', 60, 'nuevo',     'Consultó por financiamiento.'),
  ('4b95ac57-aea0-4e3f-8d82-b3f7bf2dda47', '64f1e7f7-27b7-438b-afda-345698fef558', 'Jorge Mendoza',  'jorge@test.com', '999-222-222', 45, 'nuevo',     'Primer contacto por web.'),
  ('5b95ac57-aea0-4e3f-8d82-b3f7bf2dda48', '69f1e7f7-27b7-438b-afda-345698fef553', 'Lucía Fernández','lucia@test.com', '999-333-333', 90, 'calificado','Cliente VIP, busca casa con jardín.')
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
-- 8. MÉTRICAS_CLICKS (legacy)
-- =============================================================================
insert into public.metricas_clicks (propiedad_id, tipo_evento, sesion_id, pagina_origen)
values
  ('64f1e7f7-27b7-438b-afda-345698fef558', 'click',       's-001', '/propiedades/lote-a01'),
  ('64f1e7f7-27b7-438b-afda-345698fef558', 'vista_detalle','s-001', '/propiedades/lote-a01'),
  ('64f1e7f7-27b7-438b-afda-345698fef558', 'favorito',    's-001', '/propiedades/lote-a01'),
  ('65f1e7f7-27b7-438b-afda-345698fef559', 'click',       's-002', '/propiedades/lote-a02'),
  ('65f1e7f7-27b7-438b-afda-345698fef559', 'contacto',    's-002', '/propiedades/lote-a02'),
  ('66f1e7f7-27b7-438b-afda-345698fef550', 'click',       's-003', '/propiedades/lote-a03'),
  ('67f1e7f7-27b7-438b-afda-345698fef551', 'vista_detalle','s-004', '/propiedades/dept-101'),
  ('68f1e7f7-27b7-438b-afda-345698fef552', 'click',       's-005', '/propiedades/dept-102'),
  ('68f1e7f7-27b7-438b-afda-345698fef552', 'favorito',    's-005', '/propiedades/dept-102'),
  ('69f1e7f7-27b7-438b-afda-345698fef553', 'click',       's-006', '/propiedades/casa-01'),
  ('6af1e7f7-27b7-438b-afda-345698fef554', 'vista_detalle','s-007', '/propiedades/ofic-01'),
  ('6bf1e7f7-27b7-438b-afda-345698fef555', 'click',       's-008', '/propiedades/local-01')
;

-- =============================================================================
-- 9. TRANSACCIONES (lotización)
-- =============================================================================
insert into public.transacciones (id, lote_id, tipo, comprador_nombre, comprador_documento, comprador_email, comprador_telefono, monto, moneda, id_vendedor, notas)
values
  ('4eed196f-5f34-41ed-9145-6aa9fc55da61', 'f6a7b8c9-d0e1-2345-fabc-de6789012346', 'venta',   'Pedro Gómez',  'DNI-87654321', 'pedro@test.com',  '999-777-777', 150000.00, 'PEN', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Venta directa, pago completo.'),
  ('5eed196f-5f34-41ed-9145-6aa9fc55da62', 'd4e5f6a7-b8c9-0123-defa-bc4567899014', 'reserva', 'Rosa Delgado', 'DNI-12345678', 'rosa@test.com',   '999-888-888',  5000.00,  'PEN', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Seña de reserva, 48h para firma.'),
  ('6eed196f-5f34-41ed-9145-6aa9fc55da63', 'c3d4e5f6-a7b8-9012-cdef-ab3456789013', 'venta',   'Miguel Soto',  'DNI-45678912', 'miguel@test.com', '999-999-999',  72000.00, 'PEN', 'b2c3d4e5-f6a7-8901-bcde-fa2345678901', 'Crédito hipotecario aprobado.')
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
-- 10. TOURS 360 (Virtual Tours)
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
  -- Tour 4: Lote MZ-B LT-02 (2 escenas, borrador)
  (
    'd4e5f6a7-b8c9-0123-defa-bc4567899002',
    '619882a9-4783-43b9-b902-74d10e491a70',
    'Tour 360° - Lote MZ-B LT-02',
    'Tour virtual del lote disponible con vista aparcamiento',
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
-- 11. TOUR POIs (Points of Interest) — all IDs must be UUIDs
-- =============================================================================
insert into public.tour_pois (id, tour_id, name, description, poi_type, icon, lat, lng, metadata)
values
  -- POIs for Urbanización Los Olivos tour
  ('aaaa0001-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567899', 'Parque Infantil',         'Área de juegos para niños con césped sintético',     'amenity',  '🎠', -12.1355, -76.9965, '{"hours": "6:00 - 22:00", "capacity": 20}'),
  ('aaaa0001-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567899', 'Pista de Correr',         'Ciclovía de 500m alrededor del proyecto',           'amenity',  '🏃', -12.1358, -76.9962, '{"length_meters": 500, "lit": true}'),
  ('aaaa0001-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567899', 'Salón de Eventos',        'Salón multiuso para reuniones y celebraciones',     'amenity',  '🎪', -12.1360, -76.9968, '{"area_m2": 80, "capacity": 50}'),
  ('aaaa0001-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567899', 'Comisaría Vecinal',       'Punto de control de seguridad 24/7',                'landmark', '🚓', -12.1362, -76.9970, '{"security_hours": "24/7"}'),
  ('aaaa0001-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567899', 'Lote MZ-A LT-01',         'Lote esquinero disponible - 120m²',                'amenity',  '🏠', -12.1364, -76.9961, '{"lote_id": "b7b0dee1-b948-4303-ab91-3b0fc41ffa17", "status": "disponible", "price_pen": 85000}'),
  ('aaaa0001-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567899', 'Lote MZ-A LT-02',         'Lote frente a parque - 100m²',                    'amenity',  '🏡', -12.1364, -76.9957, '{"lote_id": "c3d4e5f6-a7b8-9012-cdef-ab3456789013", "status": "disponible", "price_pen": 72000}'),
  -- POIs for Residencial San Felipe tour
  ('aaaa0002-0000-0000-0000-000000000001', 'b2c3d4e5-f6a7-8901-bcde-fa2345678900', 'Iglesia San Felipe',      'Monumento histórico del siglo XIX',                'landmark', '⛪', -12.1152, -77.0305, '{"year_built": 1850, "heritage": true}'),
  ('aaaa0002-0000-0000-0000-000000000002', 'b2c3d4e5-f6a7-8901-bcde-fa2345678900', 'Parque Jesús María',      'Parque central con cancha deportiva',              'amenity',  '🌳', -12.1148, -77.0302, '{"area_m2": 2500, "sports_court": true}'),
  ('aaaa0002-0000-0000-0000-000000000003', 'b2c3d4e5-f6a7-8901-bcde-fa2345678900', 'Casa Modelo CASA-01',     'Casa de 2 pisos con jardín - 220m²',              'attraction','🏡', -12.1150, -77.0300, '{"propiedad_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567891", "status": "disponible", "price_pen": 185000}'),
  ('aaaa0002-0000-0000-0000-000000000004', 'b2c3d4e5-f6a7-8901-bcde-fa2345678900', 'Casa CASA-02',            'Casa residencial - 250m²',                        'amenity',  '🏠', -12.1155, -77.0295, '{"propiedad_id": "b2c3d4e5-f6a7-8901-bcde-fa2345678902", "status": "reservado"}'),
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
-- 12. ANALYTICS EVENTS (Tour Tracking) — all IDs must be UUIDs
-- =============================================================================
insert into public.analytics_events (id, event_type, tour_id, parcel_id, visitor_id, metadata)
values
  -- Los Olivos tour: 2 visitors, full cycle
  ('bbbb0001-0000-0000-0000-000000000001', 'tour_start',    'a1b2c3d4-e5f6-7890-abcd-ef1234567899', null,                                           'visitor-001', '{"device": "desktop", "browser": "Chrome", "os": "Windows"}'),
  ('bbbb0001-0000-0000-0000-000000000002', 'tour_end',      'a1b2c3d4-e5f6-7890-abcd-ef1234567899', null,                                           'visitor-001', '{"duration_seconds": 180, "scenes_viewed": 3}'),
  ('bbbb0001-0000-0000-0000-000000000003', 'tour_start',    'a1b2c3d4-e5f6-7890-abcd-ef1234567899', null,                                           'visitor-002', '{"device": "mobile", "browser": "Safari", "os": "iOS"}'),
  ('bbbb0001-0000-0000-0000-000000000004', 'tour_end',      'a1b2c3d4-e5f6-7890-abcd-ef1234567899', null,                                           'visitor-002', '{"duration_seconds": 240, "scenes_viewed": 3}'),
  -- Parcel clicks
  ('bbbb0001-0000-0000-0000-000000000005', 'parcel_click',  'a1b2c3d4-e5f6-7890-abcd-ef1234567899', 'b7b0dee1-b948-4303-ab91-3b0fc41ffa17',          'visitor-001', '{"scene_id": "11111111-1111-1111-1111-111111111103", "click_position_x": 0.65, "click_position_y": 0.32}'),
  ('bbbb0001-0000-0000-0000-000000000006', 'parcel_click',  'a1b2c3d4-e5f6-7890-abcd-ef1234567899', 'c3d4e5f6-a7b8-9012-cdef-ab3456789013',          'visitor-002', '{"scene_id": "11111111-1111-1111-1111-111111111101", "click_position_x": 0.45, "click_position_y": 0.55}'),
  ('bbbb0001-0000-0000-0000-000000000007', 'parcel_click',  'a1b2c3d4-e5f6-7890-abcd-ef1234567899', 'b7b0dee1-b948-4303-ab91-3b0fc41ffa17',          'visitor-003', '{"scene_id": "11111111-1111-1111-1111-111111111101", "click_position_x": 0.70, "click_position_y": 0.40}'),
  ('bbbb0001-0000-0000-0000-000000000008', 'parcel_click',  'a1b2c3d4-e5f6-7890-abcd-ef1234567899', 'd4e5f6a7-b8c9-0123-defa-bc4567899014',          'visitor-003', '{"scene_id": "11111111-1111-1111-1111-111111111102", "click_position_x": 0.30, "click_position_y": 0.60}'),
  -- WhatsApp clicks
  ('bbbb0001-0000-0000-0000-000000000009', 'whatsapp_click', 'a1b2c3d4-e5f6-7890-abcd-ef1234567899', 'b7b0dee1-b948-4303-ab91-3b0fc41ffa17',          'visitor-001', '{"scene_id": "11111111-1111-1111-1111-111111111103"}'),
  ('bbbb0001-0000-0000-0000-000000000010', 'whatsapp_click', 'a1b2c3d4-e5f6-7890-abcd-ef1234567899', 'c3d4e5f6-a7b8-9012-cdef-ab3456789013',          'visitor-002', '{"scene_id": "11111111-1111-1111-1111-111111111101"}'),
  -- Share clicks
  ('bbbb0001-0000-0000-0000-000000000011', 'share_click',   'a1b2c3d4-e5f6-7890-abcd-ef1234567899', null,                                           'visitor-001', '{"method": "facebook"}'),
  ('bbbb0001-0000-0000-0000-000000000012', 'share_click',   'a1b2c3d4-e5f6-7890-abcd-ef1234567899', null,                                           'visitor-003', '{"method": "whatsapp"}'),

  -- San Felipe tour
  ('bbbb0002-0000-0000-0000-000000000001', 'tour_start',    'b2c3d4e5-f6a7-8901-bcde-fa2345678900', null,                                           'visitor-004', '{"device": "desktop", "browser": "Firefox", "os": "Linux"}'),
  ('bbbb0002-0000-0000-0000-000000000002', 'tour_end',      'b2c3d4e5-f6a7-8901-bcde-fa2345678900', null,                                           'visitor-004', '{"duration_seconds": 320, "scenes_viewed": 3}'),
  ('bbbb0002-0000-0000-0000-000000000003', 'parcel_click',  'b2c3d4e5-f6a7-8901-bcde-fa2345678900', null,                                           'visitor-004', '{"scene_id": "22222222-2222-2222-2222-222222222201"}'),
  ('bbbb0002-0000-0000-0000-000000000004', 'whatsapp_click', 'b2c3d4e5-f6a7-8901-bcde-fa2345678900', null,                                           'visitor-005', '{"scene_id": "22222222-2222-2222-2222-222222222202"}'),
  ('bbbb0002-0000-0000-0000-000000000005', 'share_click',   'b2c3d4e5-f6a7-8901-bcde-fa2345678900', null,                                           'visitor-004', '{"method": "copy_link"}'),

  -- Torres del Sur tour
  ('bbbb0003-0000-0000-0000-000000000001', 'tour_start',    'c3d4e5f6-a7b8-9012-cdef-ab3456789001', null,                                           'visitor-005', '{"device": "mobile", "browser": "Chrome", "os": "Android"}'),
  ('bbbb0003-0000-0000-0000-000000000002', 'tour_end',      'c3d4e5f6-a7b8-9012-cdef-ab3456789001', null,                                           'visitor-005', '{"duration_seconds": 150, "scenes_viewed": 2}'),
  ('bbbb0003-0000-0000-0000-000000000003', 'tour_start',    'c3d4e5f6-a7b8-9012-cdef-ab3456789001', null,                                           'visitor-006', '{"device": "desktop", "browser": "Edge", "os": "Windows"}'),
  ('bbbb0003-0000-0000-0000-000000000004', 'tour_end',      'c3d4e5f6-a7b8-9012-cdef-ab3456789001', null,                                           'visitor-006', '{"duration_seconds": 200, "scenes_viewed": 3}'),
  ('bbbb0003-0000-0000-0000-000000000005', 'parcel_click',  'c3d4e5f6-a7b8-9012-cdef-ab3456789001', 'c3d4e5f6-a7b8-9012-cdef-ab3456789015',          'visitor-005', '{"scene_id": "33333333-3333-3333-3333-333333333302"}'),
  ('bbbb0003-0000-0000-0000-000000000006', 'parcel_click',  'c3d4e5f6-a7b8-9012-cdef-ab3456789001', 'd4e5f6a7-b8c9-0123-defa-bc4567899016',          'visitor-006', '{"scene_id": "33333333-3333-3333-3333-333333333303"}'),
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
