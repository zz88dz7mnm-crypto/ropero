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

-- Remeras reales (las imágenes viven en /img/remeras dentro del repo).
insert into remeras (nombre, imagen_url, colores, estilos, climas, corte, ocasiones, diseno, tipo_outfit, notas) values
(
  'Remera The Smiths blanca',
  'img/remeras/smiths-meat-is-murder.png',
  '{"blanco","verde oscuro","negro"}',
  '{"band tee","vintage","indie","alternativo","streetwear"}',
  '{"verano","entretiempo"}',
  'oversized',
  '{"casual","recital","salida","juntada"}',
  'estampado gráfico fotográfico (foto de álbum) + texto vertical lateral con el nombre de la banda',
  '{"streetwear","indie","casual"}',
  'Band tee estilo vintage, base blanca, gráfico central protagonista + texto lateral verde. Buena pieza statement; combina con jean recto u oversized y zapatillas retro.'
),
(
  'Remera Adidas Originals verde',
  'img/remeras/adidas-originals-verde.png',
  '{"verde","negro","amarillo"}',
  '{"deportivo","retro","casual","streetwear"}',
  '{"verano","entretiempo"}',
  'regular',
  '{"casual","deporte","salida de día"}',
  'colorblock con tres rayas y logo trébol, estilo retro fútbol/deportivo',
  '{"deportivo","casual","athleisure","retro"}',
  'Remera deportiva de marca, corte regular. Buena base para looks retro o deportivos; combina con jogging, jean o short.'
),
(
  'Remera negra encapuchado',
  'img/remeras/encapuchado-negra.png',
  '{"negro","beige"}',
  '{"streetwear","urbano","oscuro","statement"}',
  '{"entretiempo","invierno templado"}',
  'oversized',
  '{"salida de noche","casual","juntada"}',
  'estampado gráfico ilustrado (retrato encapuchado con lentes de sol) más firma cursiva',
  '{"streetwear","urbano","dark"}',
  'Remera negra oversized con gráfico grande centrado, estética dark/streetwear. Protagonista del outfit; combina con cargo o jogger negro.'
);
