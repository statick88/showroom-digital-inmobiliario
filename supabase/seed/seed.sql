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
  ('619882a9-4783-43b9-b902-74d10e491a70', 'Urbanización Los Olivos', 'Proyecto residencial en Surco, Lima.',        'Av. Los Olivos 100, Santiago de Surco', '{"lat": -12.1360, "lng": -76.9960}', 'https://placehold.co/1200x400/1e293b/FFF?text=Urbanizaci%C3%B3n+Los+Olivos', true),
  ('7c8d9e0f-1a2b-4c3d-4e5f-6a7b8c9d0e1f', 'Residencial San Felipe', 'Condominio de casas en Jesús María.',         'Calle San Felipe 200, Jesús María',      '{"lat": -12.1150, "lng": -77.0300}', 'https://placehold.co/1200x400/1e3a8a/FFF?text=Residencial+San+Felipe',   true),
  ('9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d', 'Torres del Sur',          'Edificio de departamentos en Villa El Salvador.', 'Av. Distrital 500, Villa El Salvador', '{"lat": -12.2200, "lng": -76.9700}', 'https://placehold.co/1200x400/7c3aed/FFF?text=Torres+del+Sur', true)
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
-- auth_user_id se reserva para Supabase Auth. Este seed usa solo datos públicos.
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
  ('b7b0dee1-b948-4303-ab91-3b0fc41ffa17', '619882a9-4783-43b9-b902-74d10e491a70', 'MZ-A LT-01', 120.00, 6.00, 20.00, 85000.00,  'PEN', 'disponible', '{"type":"Polygon","coordinates":[[[-76.9961,-12.1364],[-76.9959,-12.1364],[-76.9959,-12.1356],[-76.9961,-12.1356],[-76.9961,-12.1364]]]}', 'https://placehold.co/600x400/0f172a/FFF?text=Plano+MZ-A+LT-01', 'Lote esquina, ideal para casa de 3 pisos.', 1),
  ('c3d4e5f6-a7b8-9012-cdef-ab3456789013', '619882a9-4783-43b9-b902-74d10e491a70', 'MZ-A LT-02', 100.00, 5.00, 20.00, 72000.00,  'PEN', 'disponible', '{"type":"Polygon","coordinates":[[[-76.9959,-12.1364],[-76.9957,-12.1364],[-76.9957,-12.1356],[-76.9959,-12.1356],[-76.9959,-12.1364]]]}', 'https://placehold.co/600x400/0f172a/FFF?text=Plano+MZ-A+LT-02', 'Frente a parque.', 2),
  ('d4e5f6a7-b8c9-0123-defa-bc4567899014', '619882a9-4783-43b9-b902-74d10e491a70', 'MZ-A LT-03', 150.00, 7.50, 20.00, 95000.00,  'PEN', 'reservado',  '{"type":"Polygon","coordinates":[[[-76.9957,-12.1364],[-76.9954,-12.1364],[-76.9954,-12.1356],[-76.9957,-12.1356],[-76.9957,-12.1364]]]}', 'https://placehold.co/600x400/1e293b/FFF?text=Plano+MZ-A+LT-03', 'Con vista panorámica.', 3),
  ('e5f6a7b8-c9d0-1234-efab-cd5678901235', '619882a9-4783-43b9-b902-74d10e491a70', 'MZ-B LT-01', 180.00, 8.00, 22.50, 120000.00, 'PEN', 'disponible', '{"type":"Polygon","coordinates":[[[-76.9961,-12.1356],[-76.9959,-12.1356],[-76.9959,-12.1348],[-76.9961,-12.1348],[-76.9961,-12.1356]]]}', 'https://placehold.co/600x400/1e293b/FFF?text=Plano+MZ-B+LT-01', 'Esquina doble frente.', 4),
  ('f6a7b8c9-d0e1-2345-fabc-de6789012346', '619882a9-4783-43b9-b902-74d10e491a70', 'MZ-B LT-02', 200.00, 10.00, 20.00, 150000.00,'PEN', 'vendido',    '{"type":"Polygon","coordinates":[[[-76.9959,-12.1356],[-76.9957,-12.1356],[-76.9957,-12.1348],[-76.9959,-12.1348],[-76.9959,-12.1356]]]}', 'https://placehold.co/600x400/334155/FFF?text=Plano+MZ-B+LT-02', 'Vendido a comprador particular.', 5),

  -- Proyecto 2: Residencial San Felipe
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567891', '7c8d9e0f-1a2b-4c3d-4e5f-6a7b8c9d0e1f', 'CASA-01', 220.00, 11.00, 20.00, 185000.00, 'PEN', 'disponible', '{"type":"Polygon","coordinates":[[[-77.0305,-12.1155],[-77.0295,-12.1155],[-77.0295,-12.1145],[-77.0305,-12.1145],[-77.0305,-12.1155]]]}', 'https://placehold.co/600x400/0f172a/FFF?text=Plano+CASA-01', 'Casa de 3 pisos con jardín.', 1),
  ('b2c3d4e5-f6a7-8901-bcde-fa2345678902', '7c8d9e0f-1a2b-4c3d-4e5f-6a7b8c9d0e1f', 'CASA-02', 250.00, 12.00, 20.83, 210000.00, 'PEN', 'reservado',  '{"type":"Polygon","coordinates":[[[-77.0295,-12.1155],[-77.0285,-12.1155],[-77.0285,-12.1145],[-77.0295,-12.1145],[-77.0295,-12.1155]]]}', 'https://placehold.co/600x400/1e293b/FFF?text=Plano+CASA-02', 'Reservada para familia García.', 2),

  -- Proyecto 3: Torres del Sur
  ('c3d4e5f6-a7b8-9012-cdef-ab3456789015', '9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d', 'DEPT-301', 65.00,  7.00,  9.29,  95000.00,  'PEN', 'disponible', '{"type":"Polygon","coordinates":[[[-76.9710,-12.2205],[-76.9700,-12.2205],[-76.9700,-12.2195],[-76.9710,-12.2195],[-76.9710,-12.2205]]]}', 'https://placehold.co/600x400/7c3aed/FFF?text=Plano+DEPT-301', 'Dpto 3er piso, 2 dormitorios.', 1),
  ('d4e5f6a7-b8c9-0123-defa-bc4567899016', '9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d', 'DEPT-302', 75.00,  8.00,  9.38,  115000.00, 'PEN', 'vendido',    '{"type":"Polygon","coordinates":[[[-76.9700,-12.2205],[-76.9689,-12.2205],[-76.9689,-12.2195],[-76.9700,-12.2195],[-76.9700,-12.2205]]]}', 'https://placehold.co/600x400/334155/FFF?text=Plano+DEPT-302', 'Vendido — entrega dic 2026.', 2)
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
-- 5. PERFILES (legacy) — sin auth_user_id para no tocar auth.users
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
-- 7. LEADS (legacy) — sin perfil_id para evitar FK externas
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
-- 8. MÉTRICAS_CLICKS (legacy) — sin perfil_id para no depender de perfiles
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
-- FIN SEED
-- =============================================================================
