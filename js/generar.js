// Panel "Generar": arma un outfit completo (gorra + top + pantalón +
// zapatilla) según criterios elegidos por el usuario, comparando contra los
// tags internos de cada prenda (colores/estilos/climas/ocasiones). Si se
// vuelve a generar con los MISMOS criterios, no repite una prenda ya
// mostrada hasta agotar las opciones de esa categoría.
//
// Nota: "Buzo" y "Campera" en Tren superior todavía no tienen prendas
// cargadas (solo hay remeras) — al elegirlos no va a encontrar nada hasta
// que sumemos esas prendas.

const MAPA_CLIMA = {
  frio: ["invierno", "invierno templado"],
  templado: ["entretiempo", "invierno templado", "otonio", "primavera"],
  calor: ["verano", "primavera"],
};

const MAPA_ESTACION = {
  verano: ["verano"],
  otonio: ["otonio"],
  invierno: ["invierno", "invierno templado"],
  primavera: ["primavera"],
};

const vistosPorCategoria = { gorras: new Set(), remeras: new Set(), pantalones: new Set(), zapatillas: new Set() };
let ultimoCriteriosHash = null;

document.addEventListener("ropero:listo", inicializarPanelGenerar);

function inicializarPanelGenerar() {
  const datos = window.Ropero.datos;
  const coloresDisponibles = valoresUnicos(datos, "colores");
  const estilosDisponibles = valoresUnicos(datos, "estilos");
  const ocasionesDisponibles = valoresUnicos(datos, "ocasiones");

  construirPanel(coloresDisponibles, estilosDisponibles, ocasionesDisponibles);

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

function construirPanel(colores, estilos, ocasiones) {
  const chip = (valor, label) => `<button class="pg-chip" data-valor="${valor}">${label || valor}</button>`;

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
            <button class="pg-chip activo" data-valor="remera">Remera</button>
            ${chip("buzo", "Buzo")}
            ${chip("campera", "Campera")}
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
            ${chip("verano", "Verano")}${chip("otonio", "Otoño")}${chip("invierno", "Invierno")}${chip("primavera", "Primavera")}
          </div>
        </section>
        <section class="pg-seccion">
          <h4>Ocasión</h4>
          <div class="pg-chips" data-grupo="ocasiones" data-multi="true">
            ${ocasiones.map((o) => chip(o)).join("")}
          </div>
        </section>
        <section class="pg-seccion">
          <h4>Estilo</h4>
          <div class="pg-chips" data-grupo="estilos" data-multi="true">
            ${estilos.map((e) => chip(e)).join("")}
          </div>
        </section>
        <section class="pg-seccion">
          <h4>Colores <span class="pg-hint">(hasta 3)</span></h4>
          <div class="pg-chips" data-grupo="colores" data-multi="true" data-max="3">
            ${colores.map((c) => chip(c)).join("")}
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

  const clima = seleccionUnica("clima");
  const estacion = seleccionUnica("estacion");
  const climaObjetivo = new Set([...(MAPA_CLIMA[clima] || []), ...(MAPA_ESTACION[estacion] || [])]);

  return {
    tipoSuperior: seleccionUnica("tipoSuperior") || "remera",
    climaObjetivo,
    ocasiones: seleccionMultiple("ocasiones"),
    estilos: seleccionMultiple("estilos"),
    colores: seleccionMultiple("colores"),
  };
}

function puntuarPrenda(prenda, criterios) {
  let score = 0;
  if (criterios.climaObjetivo.size) {
    score += (prenda.climas || []).filter((c) => criterios.climaObjetivo.has(c)).length;
  }
  if (criterios.estilos.length) {
    score += (prenda.estilos || []).filter((e) => criterios.estilos.includes(e)).length;
  }
  if (criterios.ocasiones.length) {
    score += (prenda.ocasiones || []).filter((o) => criterios.ocasiones.includes(o)).length;
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
    c: [...criterios.climaObjetivo].sort(),
    o: criterios.ocasiones.slice().sort(),
    e: criterios.estilos.slice().sort(),
    col: criterios.colores.slice().sort(),
  });
  if (hash !== ultimoCriteriosHash) {
    Object.values(vistosPorCategoria).forEach((s) => s.clear());
    ultimoCriteriosHash = hash;
  }

  const datos = window.Ropero.datos;
  // "tipo" viene de la base (remera/buzo/campera); si alguna prenda vieja no
  // lo tuviera todavía, la tratamos como remera por defecto.
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
    // Todavía no hay buzos/camperas cargados; no rompemos nada, solo avisamos.
    console.warn(`Todavía no hay prendas de tipo "${criterios.tipoSuperior}" cargadas.`);
  }
}
