-- Tercera prenda: gorras/gorros. Misma lógica de tags internos.
-- Corré esto en el SQL Editor de Supabase.

create table if not exists gorras (
  id uuid primary key default gen_random_uuid(),
  nombre text,
  imagen_url text not null,

  -- Tags internos (no se muestran en la UI):
  colores text[] not null default '{}',
  estilos text[] not null default '{}',        -- ej: {"streetwear","deportivo","casual"}
  climas text[] not null default '{}',
  tipo text,                                    -- snapback, fitted, trucker, gorro de lana, jockey
  marca_o_equipo text,                          -- ej: "New Era - San Diego Padres"
  ocasiones text[] not null default '{}',
  diseno text,                                  -- liso, con logo bordado, con parche, etc
  tipo_outfit text[] not null default '{}',
  notas text,

  creado_en timestamptz not null default now()
);

alter table gorras enable row level security;

create policy "gorras_select" on gorras for select using (true);
create policy "gorras_insert" on gorras for insert with check (true);
create policy "gorras_update" on gorras for update using (true);
create policy "gorras_delete" on gorras for delete using (true);
