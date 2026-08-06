// Capa de acceso a datos: todo lo que toca la base pasa por acá.
// Si el día de mañana cambiamos de backend, sólo se toca este archivo.

async function listarPrendas() {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client
    .from("prendas")
    .select("*")
    .order("creado_en", { ascending: false });
  if (error) {
    console.error("Error listando prendas:", error);
    return [];
  }
  return data;
}

async function crearPrenda(prenda) {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase no está configurado todavía.");
  const { data, error } = await client
    .from("prendas")
    .insert([prenda])
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function eliminarPrenda(id) {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase no está configurado todavía.");
  const { error } = await client.from("prendas").delete().eq("id", id);
  if (error) throw error;
}

async function guardarOutfit(outfit) {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase no está configurado todavía.");
  const { data, error } = await client
    .from("outfits")
    .insert([outfit])
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function listarOutfits() {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client
    .from("outfits")
    .select("*")
    .order("creado_en", { ascending: false });
  if (error) {
    console.error("Error listando outfits:", error);
    return [];
  }
  return data;
}
