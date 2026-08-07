-- Segunda prenda: pantalones. Misma lógica que remeras (tags internos, no se
-- muestran en la UI). Corré esto en el SQL Editor de Supabase.

create table if not exists pantalones (
  id uuid primary key default gen_random_uuid(),
  nombre text,
  imagen_url text not null,

  -- Tags internos (no se muestran en la UI):
  colores text[] not null default '{}',       -- ej: {"negro","azul"}
  estilos text[] not null default '{}',        -- ej: {"streetwear","urbano","casual","formal","deportivo"}
  climas text[] not null default '{}',         -- ej: {"verano","invierno","entretiempo"}
  corte text,                                  -- skinny, slim, regular, recto, wide leg, cargo, jogger, oversized
  largo text,                                  -- largo, corto, capri/pescador
  tela text,                                   -- denim/jean, gabardina, corderoy, algodón, friza/deportiva
  ocasiones text[] not null default '{}',      -- ej: {"casual","salida","laburo","deporte","noche"}
  diseno text,                                 -- liso, roto/desgastado, cargo con bolsillos, cintura alta, etc
  tipo_outfit text[] not null default '{}',    -- con qué tipo de outfit combina mejor
  notas text,

  creado_en timestamptz not null default now()
);

alter table pantalones enable row level security;

create policy "pantalones_select" on pantalones for select using (true);
create policy "pantalones_insert" on pantalones for insert with check (true);
create policy "pantalones_update" on pantalones for update using (true);
create policy "pantalones_delete" on pantalones for delete using (true);
