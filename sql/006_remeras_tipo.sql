-- Distingue remera / buzo / campera dentro de la misma tabla ("tren superior").
-- Las remeras existentes quedan con tipo='remera' automáticamente (DEFAULT).
-- Corré esto en el SQL Editor de Supabase.

alter table remeras add column if not exists tipo text not null default 'remera'
  check (tipo in ('remera', 'buzo', 'campera'));
