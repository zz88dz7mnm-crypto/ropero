// Mini "IA" del ropero: por ahora es un motor de reglas (sin modelos, sin costo,
// sin dependencias). Filtra por clima + ocasión y arma una combinación.
// El día que quieras, esto se puede reemplazar por un modelo real sin tocar el resto de la app.

const CATEGORIA_SUPERIOR = ["remera", "buzo"];
const CATEGORIA_INFERIOR = ["pantalon", "short", "pollera"];
const CATEGORIA_CALZADO = ["calzado"];
const CATEGORIA_ABRIGO = ["abrigo"];
const CATEGORIA_VESTIDO = ["vestido"];
const CATEGORIA_ACCESORIO = ["accesorio"];

function estacionActualArgentina() {
  // Hemisferio sur.
  const mes = new Date().getMonth() + 1; // 1-12
  if ([12, 1, 2].includes(mes)) return "verano";
  if ([3, 4, 5].includes(mes)) return "otonio";
  if ([6, 7, 8].includes(mes)) return "invierno";
  return "primavera";
}

async function obtenerClimaActual() {
  const fallback = {
    temperatura: null,
    condicion: "desconocido",
    estacion: estacionActualArgentina(),
  };

  if (!navigator.geolocation) return fallback;

  try {
    const posicion = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 4000,
      });
    });
    const { latitude, longitude } = posicion.coords;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
    const resp = await fetch(url);
    if (!resp.ok) return fallback;
    const json = await resp.json();
    const temp = json?.current_weather?.temperature ?? null;
    return {
      temperatura: temp,
      condicion: clasificarTemperatura(temp),
      estacion: estacionActualArgentina(),
    };
  } catch (e) {
    console.warn("No se pudo obtener el clima (geolocalización/red):", e);
    return fallback;
  }
}

function clasificarTemperatura(temp) {
  if (temp === null || temp === undefined) return "desconocido";
  if (temp <= 10) return "frio";
  if (temp <= 20) return "templado";
  return "calor";
}

function prendaSirveParaEstacion(prenda, estacion) {
  if (!prenda.estaciones || prenda.estaciones.length === 0) return true;
  return prenda.estaciones.includes(estacion);
}

function elegirAlAzar(lista) {
  if (!lista.length) return null;
  return lista[Math.floor(Math.random() * lista.length)];
}

/**
 * Arma un outfit sugerido a partir de las prendas disponibles y un contexto
 * (clima + ocasión). Devuelve { prendas: [...], motivo }.
 */
function recomendarOutfit(prendas, contexto = {}) {
  const estacion = contexto.estacion || estacionActualArgentina();
  const ocasion = contexto.ocasion || "casual";
  const condicion = contexto.condicion || "templado";

  const disponibles = prendas.filter((p) => prendaSirveParaEstacion(p, estacion));
  const porFormalidad = disponibles.filter((p) => p.formalidad === ocasion);
  const pool = porFormalidad.length ? porFormalidad : disponibles;

  const vestidos = pool.filter((p) => CATEGORIA_VESTIDO.includes(p.categoria));
  const elegidos = [];

  // Camino 1: vestido + calzado (+ abrigo si hace frío)
  if (vestidos.length && Math.random() < 0.4) {
    elegidos.push(elegirAlAzar(vestidos));
  } else {
    const superior = elegirAlAzar(pool.filter((p) => CATEGORIA_SUPERIOR.includes(p.categoria)));
    const inferior = elegirAlAzar(pool.filter((p) => CATEGORIA_INFERIOR.includes(p.categoria)));
    if (superior) elegidos.push(superior);
    if (inferior) elegidos.push(inferior);
  }

  const calzado = elegirAlAzar(pool.filter((p) => CATEGORIA_CALZADO.includes(p.categoria)));
  if (calzado) elegidos.push(calzado);

  if (condicion === "frio") {
    const abrigo = elegirAlAzar(pool.filter((p) => CATEGORIA_ABRIGO.includes(p.categoria)));
    if (abrigo) elegidos.push(abrigo);
  }

  if (Math.random() < 0.3) {
    const accesorio = elegirAlAzar(pool.filter((p) => CATEGORIA_ACCESORIO.includes(p.categoria)));
    if (accesorio) elegidos.push(accesorio);
  }

  const motivo = `Para ${ocasion}, clima ${condicion} (${estacion}).`;
  return { prendas: elegidos.filter(Boolean), motivo };
}
