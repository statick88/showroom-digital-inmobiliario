-- Seed data para desarrollo

insert into public.agencias (id, nombre, plan) values
  ('a0000000-0000-0000-0000-000000000001', 'Inmobiliaria Demo', 'premium');

insert into public.propiedades (id, codigo, tipo, estado, precio, titulo, descripcion, area_m2, cuartos, banios, distrito, ciudad, ubicacion, svg_id, agencia_id, publicada) values
  ('00000001-0000-0000-0000-000000000001', 'LOTE-A01', 'lote', 'disponible', 85000, 'Lote A-01 - Urbanización Los Olivos', 'Terreno esquinero de 120m², ideal para casa o negocio. Zona residencial con todos los servicios.', 120, null, null, 'Santiago de Surco', 'Lima', point(-76.9967, -12.1354), 'lote-a01', 'a0000000-0000-0000-0000-000000000001', true),
  ('00000001-0000-0000-0000-000000000002', 'LOTE-A02', 'lote', 'disponible', 72000, 'Lote A-02 - Urbanización Los Olivos', 'Lote de 100m² frente a parque. Excelente ubicación cerca de colegios y centros comerciales.', 100, null, null, 'Santiago de Surco', 'Lima', point(-76.9955, -12.1360), 'lote-a02', 'a0000000-0000-0000-0000-000000000001', true),
  ('00000001-0000-0000-0000-000000000003', 'LOTE-A03', 'lote', 'separado', 95000, 'Lote A-03 - Urbanización Los Olivos', 'Lote de 150m² con vista panorámica. Ideal para casa de 3 pisos.', 150, null, null, 'Santiago de Surco', 'Lima', point(-76.9948, -12.1368), 'lote-a03', 'a0000000-0000-0000-0000-000000000001', true),
  ('00000001-0000-0000-0000-000000000004', 'DEPT-101', 'departamento', 'vendido', 180000, 'Departamento 101 - Edificio Central', 'Departamento de 80m², 3 dormitorios, 2 baños, sala comedor, cocina abierta. Incluye estacionamiento.', 80, 3, 2, 'Miraflores', 'Lima', point(-77.0282, -12.1220), 'dept-101', 'a0000000-0000-0000-0000-000000000001', true),
  ('00000001-0000-0000-0000-000000000005', 'DEPT-102', 'departamento', 'disponible', 195000, 'Departamento 102 - Edificio Central', 'Departamento de 90m², 3 dormitorios, 2 baños, balcón con vista a la ciudad. Incluye estacionamiento y depósito.', 90, 3, 2, 'Miraflores', 'Lima', point(-77.0278, -12.1215), 'dept-102', 'a0000000-0000-0000-0000-000000000001', true);
