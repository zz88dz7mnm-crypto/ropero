-- La sección del menú "Guardados" pasó a llamarse "Favoritos". Esto
-- renombra la tabla (y sus policies) preservando los datos que ya tengas
-- guardados — no borra ni recrea nada.
-- Corré esto en el SQL Editor de Supabase.

alter table outfits_guardados rename to outfits_favoritos;

alter policy "outfits_guardados_select" on outfits_favoritos rename to "outfits_favoritos_select";
alter policy "outfits_guardados_insert" on outfits_favoritos rename to "outfits_favoritos_insert";
alter policy "outfits_guardados_delete" on outfits_favoritos rename to "outfits_favoritos_delete";
