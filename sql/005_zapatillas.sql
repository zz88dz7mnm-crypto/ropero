-- Cuarta prenda: zapatillas. Misma lógica de tags internos.
-- Corré esto en el SQL Editor de Supabase.

create table if not exists zapatillas (
  id uuid primary key default gen_random_uuid(),
  nombre text,
  imagen_url text not null,

  colores text[] not null default '{}',
  estilos text[] not null default '{}',
  climas text[] not null default '{}',
  tipo text,                                    -- urbana, skate, bota, running, plataforma
  marca_o_modelo text,
  ocasiones text[] not null default '{}',
  diseno text,
  tipo_outfit text[] not null default '{}',
  notas text,

  creado_en timestamptz not null default now()
);

alter table zapatillas enable row level security;

create policy "zapatillas_select" on zapatillas for select using (true);
create policy "zapatillas_insert" on zapatillas for insert with check (true);
create policy "zapatillas_update" on zapatillas for update using (true);
create policy "zapatillas_delete" on zapatillas for delete using (true);
