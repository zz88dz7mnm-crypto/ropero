// Capa de acceso a datos: todo lo que toca la base pasa por acá.

async function listarRemeras() {
  const client = getSupabaseClient();
  if (!client) return [];
  // Trae remeras + buzos + camperas juntos (los distingue `tipo`); app.js
  // los separa: remera/buzo van al eje de tren superior, campera va a la
  // rueda semicircular (js/rueda-demo.js). El creado_en de las 4 camperas
  // se ajustó a mano para que la rueda las muestre de la más usada a la
  // menos usada, mismo truco que ya se usó con las zapatillas.
  const { data, error } = await client
    .from("remeras")
    .select("*")
    .order("creado_en", { ascending: false });
  if (error) {
    console.error("Error listando remeras:", error);
    return [];
  }
  return data;
}

async function crearRemera(remera) {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase no está configurado todavía.");
  const { data, error } = await client.from("remeras").insert([remera]).select().single();
  if (error) throw error;
  return data;
}

async function listarPantalones() {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client
    .from("pantalones")
    .select("*")
    .order("creado_en", { ascending: false });
  if (error) {
    console.error("Error listando pantalones:", error);
    return [];
  }
  return data;
}

async function crearPantalon(pantalon) {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase no está configurado todavía.");
  const { data, error } = await client.from("pantalones").insert([pantalon]).select().single();
  if (error) throw error;
  return data;
}

async function listarGorras() {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client
    .from("gorras")
    .select("*")
    .order("creado_en", { ascending: false });
  if (error) {
    console.error("Error listando gorras:", error);
    return [];
  }
  return data;
}

async function crearGorra(gorra) {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase no está configurado todavía.");
  const { data, error } = await client.from("gorras").insert([gorra]).select().single();
  if (error) throw error;
  return data;
}

async function listarZapatillas() {
  const client = getSupabaseClient();
  if (!client) return [];
  // creado_en de las 8 zapatillas reales se ajustó a mano (9-ago-2026) para
  // que el orden al deslizar sea el que pidió el usuario (Gazelle,
  // Birkenstock, Ultraboost, los 2 Vans, Timberland, las 2 Havaianas) — no
  // refleja el momento real en que se cargó cada una.
  const { data, error } = await client
    .from("zapatillas")
    .select("*")
    .order("creado_en", { ascending: false });
  if (error) {
    console.error("Error listando zapatillas:", error);
    return [];
  }
  return data;
}

async function crearZapatilla(zapatilla) {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase no está configurado todavía.");
  const { data, error } = await client.from("zapatillas").insert([zapatilla]).select().single();
  if (error) throw error;
  return data;
}

async function listarFavoritos() {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client
    .from("outfits_favoritos")
    .select("*")
    .order("creado_en", { ascending: false });
  if (error) {
    console.error("Error listando favoritos:", error);
    return [];
  }
  return data;
}

async function crearFavorito(favorito) {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase no está configurado todavía.");
  const { data, error } = await client.from("outfits_favoritos").insert([favorito]).select().single();
  if (error) throw error;
  return data;
}

async function borrarFavorito(id) {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase no está configurado todavía.");
  const { error } = await client.from("outfits_favoritos").delete().eq("id", id);
  if (error) throw error;
}
