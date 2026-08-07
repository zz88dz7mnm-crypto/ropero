// Capa de acceso a datos: todo lo que toca la base pasa por acá.

async function listarRemeras() {
  const client = getSupabaseClient();
  if (!client) return [];
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
