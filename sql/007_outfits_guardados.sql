-- Outfits guardados: guarda la combinación exacta (gorra+remera+pantalón+
-- zapatilla) que estaba centrada en cada fila al momento de tildar "guardar".
-- La gorra es opcional (gorra_id null = "sin gorro"); las otras tres son
-- obligatorias porque siempre hay una prenda centrada en esas filas.
-- Corré esto en el SQL Editor de Supabase.

create table if not exists outfits_guardados (
  id uuid primary key default gen_random_uuid(),
  gorra_id uuid references gorras(id) on delete set null,
  remera_id uuid not null references remeras(id) on delete cascade,
  pantalon_id uuid not null references pantalones(id) on delete cascade,
  zapatilla_id uuid not null references zapatillas(id) on delete cascade,
  creado_en timestamptz not null default now()
);

alter table outfits_guardados enable row level security;

create policy "outfits_guardados_select" on outfits_guardados for select using (true);
create policy "outfits_guardados_insert" on outfits_guardados for insert with check (true);
create policy "outfits_guardados_delete" on outfits_guardados for delete using (true);
