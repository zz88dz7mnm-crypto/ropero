-- Ropero v2: arrancamos de cero con una tabla dedicada solo a remeras,
-- con muchos tags internos (no se muestran en la UI, los usa la IA).
-- Corré esto en el SQL Editor de Supabase.

create table if not exists remeras (
  id uuid primary key default gen_random_uuid(),
  nombre text,
  imagen_url text not null,

  -- Tags internos (no se muestran en la UI):
  colores text[] not null default '{}',       -- ej: {"blanco","negro"}
  estilos text[] not null default '{}',        -- ej: {"streetwear","urbano","casual","formal","deportivo"}
  climas text[] not null default '{}',         -- ej: {"verano","invierno","entretiempo"}
  corte text,                                  -- oversized, regular, slim, cropped, boxy
  ocasiones text[] not null default '{}',      -- ej: {"casual","salida","laburo","deporte","noche"}
  diseno text,                                 -- liso, estampado gráfico, rayas, tie-dye, logo, etc
  tipo_outfit text[] not null default '{}',    -- con qué tipo de outfit combina mejor
  notas text,                                  -- cualquier detalle extra que no entre en los tags de arriba

  creado_en timestamptz not null default now()
);

alter table remeras enable row level security;

create policy "remeras_select" on remeras for select using (true);
create policy "remeras_insert" on remeras for insert with check (true);
create policy "remeras_update" on remeras for update using (true);
create policy "remeras_delete" on remeras for delete using (true);

-- Seed de muestra (Unsplash) con tags completos, mientras me pasás tus remeras reales.
insert into remeras (nombre, imagen_url, colores, estilos, climas, corte, ocasiones, diseno, tipo_outfit, notas) values
(
  'Remera blanca básica',
  'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?w=800&q=75&auto=format&fit=crop',
  '{"blanco"}',
  '{"casual","básico","minimalista"}',
  '{"verano","entretiempo"}',
  'regular',
  '{"casual","laburo informal","salida de día"}',
  'liso',
  '{"casual","smart casual","athleisure"}',
  'Comodín, combina con todo. Base perfecta para capas.'
),
(
  'Remera negra estampada',
  'https://images.unsplash.com/photo-1604508230015-5a54faf1fa56?w=800&q=75&auto=format&fit=crop',
  '{"negro"}',
  '{"streetwear","urbano","statement"}',
  '{"entretiempo","invierno templado"}',
  'regular',
  '{"salida de noche","casual","juntada"}',
  'estampado gráfico',
  '{"streetwear","urbano"}',
  'Buena para looks con más personalidad, protagonista del outfit.'
),
(
  'Remera oversized streetwear',
  'https://images.unsplash.com/photo-1635650804263-1a1941e14df5?w=800&q=75&auto=format&fit=crop',
  '{"gris"}',
  '{"streetwear","urbano","relajado"}',
  '{"entretiempo","invierno templado"}',
  'oversized',
  '{"casual","juntada","urbano"}',
  'liso con detalle de logo',
  '{"streetwear","urbano"}',
  'Se banca cadenas/gorra, buena base para looks urbanos sueltos.'
);
