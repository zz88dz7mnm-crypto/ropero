-- Ropero: schema inicial para Supabase
-- Corré esto en: Supabase > tu proyecto > SQL Editor > New query > Run

create extension if not exists "pgcrypto";

create table if not exists prendas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  categoria text not null check (categoria in ('remera','buzo','pantalon','short','pollera','vestido','abrigo','calzado','accesorio')),
  color text,
  estaciones text[] not null default '{}',   -- 'verano','otonio','invierno','primavera'
  formalidad text not null default 'casual' check (formalidad in ('casual','formal','deportivo')),
  imagen_url text not null,
  favorita boolean not null default false,
  creado_en timestamptz not null default now()
);

create table if not exists outfits (
  id uuid primary key default gen_random_uuid(),
  nombre text,
  prenda_ids uuid[] not null,
  contexto jsonb,          -- ej: {"clima":"frio","ocasion":"casual"}
  layout jsonb,            -- posición de cada prenda en el lienzo: [{prenda_id,x,y,z}]
  creado_en timestamptz not null default now()
);

-- RLS: por ahora dejamos lectura/escritura pública (app personal, sin login todavía).
-- Cuando sumemos autenticación, esto se reemplaza por policies atadas a auth.uid().
alter table prendas enable row level security;
alter table outfits enable row level security;

create policy "prendas_select" on prendas for select using (true);
create policy "prendas_insert" on prendas for insert with check (true);
create policy "prendas_update" on prendas for update using (true);
create policy "prendas_delete" on prendas for delete using (true);

create policy "outfits_select" on outfits for select using (true);
create policy "outfits_insert" on outfits for insert with check (true);
create policy "outfits_delete" on outfits for delete using (true);

-- Seed de prueba: prendas con fotos de stock (Unsplash), para probar tags y armado de outfits
-- mientras vos me pasás las fotos reales de tu ropa.
insert into prendas (nombre, categoria, color, estaciones, formalidad, imagen_url) values
('Remera blanca básica', 'remera', 'blanco', '{"verano","primavera"}', 'casual', 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?w=600&q=70&auto=format&fit=crop'),
('Jean azul', 'pantalon', 'azul', '{"otonio","invierno","primavera"}', 'casual', 'https://images.unsplash.com/photo-1731936757642-09bccaf8b495?w=600&q=70&auto=format&fit=crop'),
('Zapatillas blancas', 'calzado', 'blanco', '{"verano","otonio","primavera"}', 'casual', 'https://images.unsplash.com/photo-1626379616459-b2ce1d9decbc?w=600&q=70&auto=format&fit=crop'),
('Campera de jean', 'abrigo', 'azul', '{"otonio","primavera"}', 'casual', 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=600&q=70&auto=format&fit=crop');
