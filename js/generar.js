// Panel "Generar": arma un outfit completo (gorra + top + pantalón +
// zapatilla) según criterios elegidos por el usuario, comparando contra los
// tags internos de cada prenda (colores/estilos/climas/ocasiones). Si se
// vuelve a generar con los MISMOS criterios, no repite una prenda ya
// mostrada hasta agotar las opciones de esa categoría.
//
// v2 (9-ago-2026, a pedido del usuario): criterios simplificados.
// - "Estación" se elimina del panel — Clima (frío/templado/calor) matchea
//   directo contra `climas` de cada prenda, sin mapa de traducción.
// - "Tren superior" pasa a Remera / Buzo (Campera se mudó a su propio
//   widget — la rueda semicircular, ver js/rueda.js — ya no es parte de
//   esta fila ni de este criterio).
// - "Ocasión" y "Estilo" pasan de listas abiertas multi-select a listas
//   CERRADAS de una sola opción: Ocasión = casual/salida/estar en casa/
//   deporte. Estilo = streetwear/alternativo/minimalista/relax (relax =
//   vibra playera/surf).
// - "Color" no cambió: sigue siendo dinámico según lo cargado, hasta 3.
//
// v3 (10-ago-2026, a pedido del usuario): dos criterios nuevos + reglas
// "duras" (no suman puntaje: directamente excluyen la prenda si no matchea).
// - "Gorra" (Sí/No, default Sí): antes la gorra siempre se elegía por
//   puntaje entre TODAS las opciones, incluido el slot "sin gorro" (podía
//   colarse por azar/ciclo aunque no se hubiera pedido, ver app.js). Ahora
//   es explícito: "Sí" elige solo entre gorras reales, "No" fuerza el slot
//   "sin gorro".
// - "Estación" vuelve al panel (verano/invierno/primavera/otoño), pero
//   convive con Clima en vez de reemplazarlo — son dos preguntas distintas
//   (qué se siente hoy vs. qué momento del año es). No hay tag `estaciones`
//   en la base todavía, así que hoy Estación solo se usa para las dos reglas
//   de abajo; el resto de las prendas no se puntúan distinto por Estación.
// - Regla dura, mallas → Estación: las mallas (malla-billabong-*, tren
//   inferior) quedan afuera del todo si se eligió una Estación puntual y no
//   es verano. Sin Estación elegida, no se restringen.
// - Regla dura, ojotas → Clima: mismo mecanismo, las ojotas Havaianas
//   (havaianas-*) solo quedan si el Clima elegido es calor (o no se eligió
//   ninguno).
// - Empuje suave, manga larga: si Clima=frío Y Estación=invierno están
//   elegidos los dos a la vez, las remeras manga larga (ml-*) suman puntaje
//   extra — no es exclusión dura, solo más probabilidad de salir elegidas.
// Los tres reconocimientos (malla/ojota/manga larga) son por nombre de
// archivo porque no hay un tag dedicado en la base para "tipo de prenda"
// en pantalones/zapatillas ni "largo de manga" en remeras — más frágil que
// un tag (si se carga una prenda nueva del mismo tipo con otro nombre, no
// la va a reconocer), pero funciona ya mismo sin tocar Supabase.

const vistosPorCategoria = { gorras: new Set(), remeras: new Set(), pantalones: new Set(), zapatillas: new Set() };
let ultimoCriteriosHash = null;

document.addEventListener("ropero:listo", inicializarPanelGenerar);

function inicializarPanelGenerar() {
  const datos = window.Ropero.datos;
  const coloresDisponibles = valoresUnicos(datos, "colores");

  construirPanel(coloresDisponibles);

  const overlay = document.getElementById("overlay-generar");
  const panel = document.getElementById("panel-generar");
  const btnCerrar = document.getElementById("btn-cerrar-generar");
  const btnSubmit = document.getElementById("btn-submit-generar");

  function abrir() {
    document.body.classList.add("generar-abierto");
    panel.setAttribute("aria-hidden", "false");
  }
  function cerrar() {
    document.body.classList.remove("generar-abierto");
    panel.setAttribute("aria-hidden", "true");
  }

  document.addEventListener("menu:accion", (ev) => {
    if (ev.detail.accion === "generar") abrir();
  });
  btnCerrar.addEventListener("click", cerrar);
  overlay.addEventListener("click", cerrar);

  panel.querySelectorAll(".pg-chips").forEach((grupo) => {
    const multi = grupo.dataset.multi === "true";
    const max = Number(grupo.dataset.max) || Infinity;
    // "tipoSuperior" y "gorra" son binarios obligatorios (siempre hay una
    // remera/buzo puesta, siempre hay gorra sí/no) — a diferencia de
    // clima/estación/ocasión/estilo (donde ningún chip activo = "sin
    // preferencia" es un estado válido), estos dos nunca deben quedar sin
    // ninguna opción resaltada, ni tocando de nuevo la que ya está activa.
    const grupoSiempreActivo = grupo.dataset.grupo === "tipoSuperior" || grupo.dataset.grupo === "gorra";
    grupo.querySelectorAll(".pg-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        if (!multi) {
          const yaActivo = chip.classList.contains("activo");
          grupo.querySelectorAll(".pg-chip").forEach((c) => c.classList.remove("activo"));
          if (!yaActivo || grupoSiempreActivo) chip.classList.add("activo");
        } else {
          const activos = grupo.querySelectorAll(".pg-chip.activo").length;
          if (!chip.classList.contains("activo") && activos >= max) return;
          chip.classList.toggle("activo");
        }
      });
    });
  });

  btnSubmit.addEventListener("click", () => {
    generarOutfit(leerCriterios(panel));
    cerrar();
  });
}

function valoresUnicos(datos, campo) {
  const set = new Set();
  [...datos.remeras, ...datos.pantalones, ...datos.gorras.filter((g) => g.imagen_url), ...datos.zapatillas].forEach(
    (p) => (p[campo] || []).forEach((v) => set.add(v))
  );
  return [...set].sort();
}

// Hex de referencia para cada color de la paleta cerrada (ver
// ropero-esquema-tags en memoria) — solo para pintar el swatch del chip,
// no se guarda en ningún lado.
const HEX_COLORES = {
  negro: "#111111",
  blanco: "#f2f2ef",
  gris: "#8a8a8a",
  beige: "#d9c7a3",
  crudo: "#ede4d3",
  marrón: "#6f4a2e",
  dorado: "#c8a24d",
  plateado: "#b9bcc2",
  rojo: "#b83232",
  naranja: "#d97a34",
  amarillo: "#d9b93c",
  verde: "#4a7a4a",
  azul: "#33517d",
  celeste: "#7fb3d5",
  violeta: "#7c5a96",
  rosa: "#d391a8",
};

function construirPanel(colores) {
  const chip = (valor, label, activo) => `<button class="pg-chip${activo ? " activo" : ""}" data-valor="${valor}">${label || valor}</button>`;

  // Los chips de color no llevan texto — son el color posta para tocar,
  // no la palabra. data-valor sigue siendo el nombre (lo que usa el
  // scoring), title/aria-label lo dejan accesible igual.
  const chipColor = (valor) =>
    `<button class="pg-chip pg-chip-color" data-valor="${valor}" title="${valor}" aria-label="${valor}" style="background-color:${HEX_COLORES[valor] || "#555"}"></button>`;

  const html = `
    <div id="overlay-generar" class="overlay-generar"></div>
    <div id="panel-generar" class="panel-generar" aria-hidden="true">
      <div class="panel-generar-header">
        <span class="panel-generar-titulo">Generar outfit</span>
        <button id="btn-cerrar-generar" class="btn-cerrar-generar" aria-label="Cerrar">✕</button>
      </div>
      <div class="panel-generar-body">
        <section class="pg-seccion">
          <h4>Tren superior</h4>
          <div class="pg-chips" data-grupo="tipoSuperior">
            ${chip("remera", "Remera", true)}
            ${chip("buzo", "Buzo")}
          </div>
        </section>
        <section class="pg-seccion">
          <h4>Gorra</h4>
          <div class="pg-chips" data-grupo="gorra">
            ${chip("si", "Sí", true)}${chip("no", "No")}
          </div>
        </section>
        <section class="pg-seccion">
          <h4>Clima</h4>
          <div class="pg-chips" data-grupo="clima">
            ${chip("frio", "Frío")}${chip("templado", "Templado")}${chip("calor", "Calor")}
          </div>
        </section>
        <section class="pg-seccion">
          <h4>Estación</h4>
          <div class="pg-chips" data-grupo="estacion">
            ${chip("verano", "Verano")}${chip("invierno", "Invierno")}${chip("primavera", "Primavera")}${chip("otono", "Otoño")}
          </div>
        </section>
        <section class="pg-seccion">
          <h4>Ocasión</h4>
          <div class="pg-chips" data-grupo="ocasion">
            ${chip("casual", "Casual")}${chip("salida", "Salida")}${chip("estar en casa", "Estar en casa")}${chip("deporte", "Deporte")}
          </div>
        </section>
        <section class="pg-seccion">
          <h4>Estilo</h4>
          <div class="pg-chips" data-grupo="estilo">
            ${chip("streetwear", "Streetwear")}${chip("alternativo", "Alternativo")}${chip("minimalista", "Minimalista")}${chip("relax", "Relax")}
          </div>
        </section>
        <section class="pg-seccion">
          <h4>Colores <span class="pg-hint">(hasta 3)</span></h4>
          <div class="pg-chips pg-chips-color" data-grupo="colores" data-multi="true" data-max="3">
            ${colores.map((c) => chipColor(c)).join("")}
          </div>
        </section>
      </div>
      <div class="panel-generar-footer">
        <button id="btn-submit-generar" class="btn-generar-submit">Generar</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", html);
}

function leerCriterios(panel) {
  function seleccionUnica(grupo) {
    const el = panel.querySelector(`.pg-chips[data-grupo="${grupo}"] .pg-chip.activo`);
    return el ? el.dataset.valor : null;
  }
  function seleccionMultiple(grupo) {
    return [...panel.querySelectorAll(`.pg-chips[data-grupo="${grupo}"] .pg-chip.activo`)].map((c) => c.dataset.valor);
  }

  return {
    tipoSuperior: seleccionUnica("tipoSuperior") || "remera",
    gorra: seleccionUnica("gorra") || "si", // "si" | "no"
    clima: seleccionUnica("clima"), // "frio" | "templado" | "calor" | null
    estacion: seleccionUnica("estacion"), // "verano" | "invierno" | "primavera" | "otono" | null
    ocasion: seleccionUnica("ocasion"), // string | null
    estilo: seleccionUnica("estilo"), // string | null
    colores: seleccionMultiple("colores"),
  };
}

// Reconocimiento por nombre de archivo (ver nota v3 arriba): sirve tanto
// para las reglas duras de generarOutfit (candidatosPantalones/
// candidatosZapatillas) como para el empuje suave de manga larga en
// puntuarPrenda.
function esMalla(pantalon) {
  return /\/malla-/i.test((pantalon && pantalon.imagen_url) || "");
}
function esOjota(zapatilla) {
  return /havaianas/i.test((zapatilla && zapatilla.imagen_url) || "");
}
function esMangaLarga(remera) {
  return /\/ml-/i.test((remera && remera.imagen_url) || "");
}

// Cada prenda puede tener MÁS de un valor en climas/estilos/ocasiones (ej.
// una gorra que sirve para calor y templado) — el criterio elegido en el
// panel es siempre uno solo, así que matchea si está incluido en la lista
// de la prenda.
function puntuarPrenda(prenda, criterios) {
  let score = 0;
  if (criterios.clima) {
    score += (prenda.climas || []).includes(criterios.clima) ? 1 : 0;
  }
  if (criterios.estilo) {
    score += (prenda.estilos || []).includes(criterios.estilo) ? 1 : 0;
  }
  if (criterios.ocasion) {
    score += (prenda.ocasiones || []).includes(criterios.ocasion) ? 1 : 0;
  }
  if (criterios.colores.length) {
    score += (prenda.colores || []).filter((c) => criterios.colores.includes(c)).length;
  }
  // Frío + invierno juntos: más tendencia a recomendar manga larga (pedido
  // del usuario) — empuje, no exclusión: +2 alcanza para pasar adelante en
  // la mayoría de los empates sin tapar del todo un match fuerte de
  // estilo+ocasión+colores en una remera de manga corta.
  if (criterios.clima === "frio" && criterios.estacion === "invierno" && esMangaLarga(prenda)) {
    score += 2;
  }
  return score;
}

function barajar(arr) {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function elegirPrenda(categoria, candidatos, criterios) {
  if (!candidatos.length) return null;
  const vistos = vistosPorCategoria[categoria];
  const ordenados = barajar(candidatos)
    .map((p) => ({ p, score: puntuarPrenda(p, criterios) }))
    .sort((a, b) => b.score - a.score);

  let disponibles = ordenados.filter((x) => !vistos.has(x.p.id));
  if (!disponibles.length) {
    vistos.clear(); // se agotaron las opciones con este criterio: reinicia el ciclo
    disponibles = ordenados;
  }
  const elegido = disponibles[0].p;
  vistos.add(elegido.id);
  return elegido;
}

function generarOutfit(criterios) {
  const hash = JSON.stringify({
    t: criterios.tipoSuperior,
    g: criterios.gorra,
    c: criterios.clima,
    est: criterios.estacion,
    o: criterios.ocasion,
    e: criterios.estilo,
    col: criterios.colores.slice().sort(),
  });
  if (hash !== ultimoCriteriosHash) {
    Object.values(vistosPorCategoria).forEach((s) => s.clear());
    ultimoCriteriosHash = hash;
  }

  const datos = window.Ropero.datos;
  // "tipo" viene de la base (remera/buzo); si alguna prenda vieja no lo
  // tuviera todavía, la tratamos como remera por defecto.
  const candidatosRemera = datos.remeras.filter((r) => (r.tipo || "remera") === criterios.tipoSuperior);

  // Gorra "No": el único candidato válido es el slot "sin gorro" (ver
  // app.js). Gorra "Sí" (default): se elige entre gorras reales únicamente.
  const sinGorro = datos.gorras.find((g) => g.id === "sin-gorro");
  const candidatosGorra = criterios.gorra === "no" ? [sinGorro].filter(Boolean) : datos.gorras.filter((g) => g.imagen_url);

  // Mallas: regla dura atada a Estación (ver nota v3 arriba). Se mantienen
  // si no es malla, o si es malla pero no se restringió (sin Estación
  // elegida, o Estación=verano).
  const candidatosPantalones = datos.pantalones.filter(
    (p) => !esMalla(p) || !criterios.estacion || criterios.estacion === "verano"
  );
  // Ojotas Havaianas: misma regla, atada a Clima en vez de Estación.
  const candidatosZapatillas = datos.zapatillas.filter(
    (z) => !esOjota(z) || !criterios.clima || criterios.clima === "calor"
  );

  const elegidos = {
    gorras: elegirPrenda("gorras", candidatosGorra, criterios),
    remeras: elegirPrenda("remeras", candidatosRemera, criterios),
    pantalones: elegirPrenda("pantalones", candidatosPantalones, criterios),
    zapatillas: elegirPrenda("zapatillas", candidatosZapatillas, criterios),
  };

  const orden = ["gorras", "remeras", "pantalones", "zapatillas"];
  orden.forEach((categoria, i) => {
    const elegido = elegidos[categoria];
    const cf = window.Ropero.coverflows[categoria];
    if (!elegido || !cf) return;
    const indice = cf.estado.items.findIndex((it) => it.id === elegido.id);
    if (indice < 0) return;
    setTimeout(() => cf.irA(indice), i * 380);
  });

  if (criterios.tipoSuperior !== "remera" && !elegidos.remeras) {
    // Todavía no hay buzos cargados; no rompemos nada, solo avisamos.
    console.warn(`Todavía no hay prendas de tipo "${criterios.tipoSuperior}" cargadas.`);
  }
}
