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
    grupo.querySelectorAll(".pg-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        if (!multi) {
          const yaActivo = chip.classList.contains("activo");
          grupo.querySelectorAll(".pg-chip").forEach((c) => c.classList.remove("activo"));
          if (!yaActivo || grupo.dataset.grupo === "tipoSuperior") chip.classList.add("activo");
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
          <h4>Clima</h4>
          <div class="pg-chips" data-grupo="clima">
            ${chip("frio", "Frío")}${chip("templado", "Templado")}${chip("calor", "Calor")}
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
    clima: seleccionUnica("clima"), // "frio" | "templado" | "calor" | null
    ocasion: seleccionUnica("ocasion"), // string | null
    estilo: seleccionUnica("estilo"), // string | null
    colores: seleccionMultiple("colores"),
  };
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
    c: criterios.clima,
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

  const elegidos = {
    gorras: elegirPrenda("gorras", datos.gorras, criterios),
    remeras: elegirPrenda("remeras", candidatosRemera, criterios),
    pantalones: elegirPrenda("pantalones", datos.pantalones, criterios),
    zapatillas: elegirPrenda("zapatillas", datos.zapatillas, criterios),
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
