// Botón "Random" del menú: arma un outfit al azar, pero no 100% independiente
// por fila. Elige una prenda "ancla" al azar (remera, pantalón o zapatilla) y
// usa sus propios tags (climas/estilos/ocasiones/colores) para elegir las
// otras prendas por afinidad — reusa el mismo scoring que ya usa el panel
// Generar (puntuarPrenda/barajar, definidos en generar.js) para no duplicar
// esa lógica. Así el resultado se relaciona entre sí en vez de salir
// cualquier combinación. Evita repetir el mismo outfit dos veces seguidas
// si hay alguna otra combinación posible.

const CATEGORIAS_ANCLA_RANDOM = ["remeras", "pantalones", "zapatillas"];
const ORDEN_CATEGORIAS_RANDOM = ["gorras", "remeras", "pantalones", "zapatillas"];
let ultimaClaveRandom = null;

document.addEventListener("menu:accion", (ev) => {
  if (ev.detail.accion === "random") generarOutfitRandom();
});

function generarOutfitRandom() {
  const datos = window.Ropero.datos;
  const listo =
    datos && datos.remeras && datos.remeras.length && datos.pantalones && datos.pantalones.length && datos.zapatillas && datos.zapatillas.length;
  if (!listo) return;

  let resultado = armarOutfitRandomUnaVez(datos);
  for (let intento = 0; intento < 5 && resultado.claveCombo === ultimaClaveRandom; intento++) {
    resultado = armarOutfitRandomUnaVez(datos);
  }
  ultimaClaveRandom = resultado.claveCombo;

  ORDEN_CATEGORIAS_RANDOM.forEach((categoria, i) => {
    const elegido = resultado.elegidos[categoria];
    const cf = window.Ropero.coverflows[categoria];
    if (!elegido || !cf) return;
    const indice = cf.estado.items.findIndex((it) => it.id === elegido.id);
    if (indice < 0) return;
    setTimeout(() => cf.irA(indice), i * 380);
  });
}

// Elige una prenda ancla al azar y arma el resto del outfit puntuando cada
// candidato contra los tags de esa ancla (misma idea que Generar, pero el
// "criterio" no lo elige el usuario a mano: sale de una prenda real).
function armarOutfitRandomUnaVez(datos) {
  const categoriaAncla = CATEGORIAS_ANCLA_RANDOM[Math.floor(Math.random() * CATEGORIAS_ANCLA_RANDOM.length)];
  const candidatosAncla = datos[categoriaAncla];
  const ancla = candidatosAncla[Math.floor(Math.random() * candidatosAncla.length)];

  const criteriosAncla = {
    climaObjetivo: new Set(ancla.climas || []),
    estilos: ancla.estilos || [],
    ocasiones: ancla.ocasiones || [],
    colores: ancla.colores || [],
  };

  const elegidos = {};
  ORDEN_CATEGORIAS_RANDOM.forEach((categoria) => {
    if (categoria === categoriaAncla) {
      elegidos[categoria] = ancla;
      return;
    }
    const candidatos = datos[categoria] || [];
    if (!candidatos.length) {
      elegidos[categoria] = null;
      return;
    }
    // El slot "sin gorro" no tiene tags (imagen_url null): contra prendas
    // con tags bastante ricos casi siempre pierde por puntaje (probado: en
    // 200 tiradas nunca salía elegido). Por eso el sorteo va en dos pasos:
    // primero "sin gorro" compite solo por probabilidad a priori (1 en N+1,
    // la misma chance que cualquier gorra real individual), y solo si no
    // gana ese sorteo se elige por afinidad entre las gorras reales.
    const sinTags = candidatos.filter((p) => !p.imagen_url);
    const conTags = candidatos.filter((p) => p.imagen_url);
    if (sinTags.length && Math.random() < sinTags.length / candidatos.length) {
      elegidos[categoria] = sinTags[Math.floor(Math.random() * sinTags.length)];
      return;
    }

    // Baraja primero y ordena por puntaje después: entre empates (muy común
    // con pocas prendas cargadas) el orden queda al azar en vez de fijo.
    const pool = conTags.length ? conTags : candidatos;
    elegidos[categoria] = barajar(pool)
      .map((p) => ({ p, score: puntuarPrenda(p, criteriosAncla) }))
      .sort((a, b) => b.score - a.score)[0].p;
  });

  const claveCombo = ORDEN_CATEGORIAS_RANDOM.map((c) => (elegidos[c] ? elegidos[c].id : "none")).join("|");
  return { elegidos, claveCombo };
}
