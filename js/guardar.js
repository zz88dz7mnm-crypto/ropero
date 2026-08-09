// Guardar outfit actual (botón cuadrado arriba a la derecha) + panel
// "Guardados" (menú lateral) que muestra todas las combinaciones guardadas
// como fotitos y, al tocar una, anima las 4 filas hasta esa combinación
// (mismo estilo de animación escalonada que usa Generar).

const ORDEN_CATEGORIAS = ["gorras", "remeras", "pantalones", "zapatillas"];
const PASO_ANIMACION_MS = 380;

let guardados = []; // filas tal cual vienen de la tabla outfits_guardados
let mapaClaveAId = new Map(); // "gorraId|remeraId|pantalonId|zapatillaId" -> id del guardado

document.addEventListener("ropero:listo", inicializarGuardar);

async function inicializarGuardar() {
  guardados = await listarGuardados();
  reconstruirMapaClaves();

  const btnGuardar = document.getElementById("btn-guardar");
  btnGuardar.addEventListener("click", alternarGuardado);
  document.addEventListener("ropero:fila-asentada", () => actualizarBotonGuardar());
  actualizarBotonGuardar();

  inicializarPanelGuardados();
}

function reconstruirMapaClaves() {
  mapaClaveAId = new Map();
  guardados.forEach((g) => mapaClaveAId.set(clave(g), g.id));
}

function clave({ gorra_id, remera_id, pantalon_id, zapatilla_id }) {
  return [gorra_id || "sin-gorro", remera_id, pantalon_id, zapatilla_id].join("|");
}

// Lee qué prenda está centrada ahora mismo en cada una de las 4 filas.
function outfitActual() {
  const cfs = window.Ropero.coverflows;
  if (!cfs.remeras || !cfs.pantalones || !cfs.zapatillas) return null;

  const idCentrado = (cf) => {
    if (!cf) return null;
    const item = cf.estado.items[Math.round(cf.estado.indiceActual)];
    return item ? item.id : null;
  };

  const gorraId = idCentrado(cfs.gorras);
  const remeraId = idCentrado(cfs.remeras);
  const pantalonId = idCentrado(cfs.pantalones);
  const zapatillaId = idCentrado(cfs.zapatillas);
  if (!remeraId || !pantalonId || !zapatillaId) return null;

  return {
    gorra_id: gorraId && gorraId !== "sin-gorro" ? gorraId : null,
    remera_id: remeraId,
    pantalon_id: pantalonId,
    zapatilla_id: zapatillaId,
  };
}

function actualizarBotonGuardar() {
  const btnGuardar = document.getElementById("btn-guardar");
  const actual = outfitActual();
  const yaGuardado = actual && mapaClaveAId.has(clave(actual));
  btnGuardar.classList.toggle("activo", !!yaGuardado);
  btnGuardar.setAttribute("aria-pressed", yaGuardado ? "true" : "false");
}

async function alternarGuardado() {
  const actual = outfitActual();
  if (!actual) return;
  const k = clave(actual);
  const btnGuardar = document.getElementById("btn-guardar");

  if (mapaClaveAId.has(k)) {
    const id = mapaClaveAId.get(k);
    btnGuardar.classList.remove("activo");
    btnGuardar.setAttribute("aria-pressed", "false");
    try {
      await borrarGuardado(id);
      guardados = guardados.filter((g) => g.id !== id);
      mapaClaveAId.delete(k);
      renderizarGrillaGuardados();
    } catch (err) {
      console.error("No se pudo borrar el guardado:", err);
      btnGuardar.classList.add("activo"); // revierte el toggle visual si falló
      btnGuardar.setAttribute("aria-pressed", "true");
    }
    return;
  }

  btnGuardar.classList.add("activo");
  btnGuardar.setAttribute("aria-pressed", "true");
  try {
    const nuevo = await crearGuardado(actual);
    guardados.unshift(nuevo);
    mapaClaveAId.set(k, nuevo.id);
    renderizarGrillaGuardados();
  } catch (err) {
    console.error("No se pudo guardar el outfit:", err);
    btnGuardar.classList.remove("activo");
    btnGuardar.setAttribute("aria-pressed", "false");
  }
}

// ===== Panel "Guardados" =====

function inicializarPanelGuardados() {
  const html = `
    <div id="overlay-guardados" class="overlay-guardados"></div>
    <div id="panel-guardados" class="panel-guardados" aria-hidden="true">
      <div class="panel-guardados-header">
        <span class="panel-guardados-titulo">Guardados</span>
        <button id="btn-cerrar-guardados" class="btn-cerrar-guardados" aria-label="Cerrar">✕</button>
      </div>
      <div class="panel-guardados-body">
        <div id="grilla-guardados" class="grilla-guardados"></div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", html);

  const overlay = document.getElementById("overlay-guardados");
  const panel = document.getElementById("panel-guardados");
  const btnCerrar = document.getElementById("btn-cerrar-guardados");

  function abrir() {
    renderizarGrillaGuardados();
    document.body.classList.add("guardados-abierto");
    panel.setAttribute("aria-hidden", "false");
  }
  function cerrar() {
    document.body.classList.remove("guardados-abierto");
    panel.setAttribute("aria-hidden", "true");
  }

  document.addEventListener("menu:accion", (ev) => {
    if (ev.detail.accion === "guardados") abrir();
  });
  btnCerrar.addEventListener("click", cerrar);
  overlay.addEventListener("click", cerrar);
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") cerrar();
  });

  renderizarGrillaGuardados();
}

function buscarPrenda(categoria, id) {
  if (!id) return null;
  return (window.Ropero.datos[categoria] || []).find((it) => it.id === id) || null;
}

function renderizarGrillaGuardados() {
  const grilla = document.getElementById("grilla-guardados");
  if (!grilla) return;

  if (!guardados.length) {
    grilla.innerHTML = `<div class="guardados-vacio">Todavía no guardaste ningún outfit.<br>Tocá el cuadradito de arriba a la derecha para guardar el que tenés armado.</div>`;
    return;
  }

  grilla.innerHTML = guardados
    .map((g) => {
      const prendas = [
        buscarPrenda("gorras", g.gorra_id),
        buscarPrenda("remeras", g.remera_id),
        buscarPrenda("pantalones", g.pantalon_id),
        buscarPrenda("zapatillas", g.zapatilla_id),
      ].filter((p) => p && p.imagen_url);

      const imgs = prendas.map((p) => `<img src="${p.imagen_url}" alt="${p.nombre || ""}" draggable="false" />`).join("");
      return `<button class="tarjeta-guardado" data-id="${g.id}">${imgs}</button>`;
    })
    .join("");

  grilla.querySelectorAll(".tarjeta-guardado").forEach((tarjeta) => {
    tarjeta.addEventListener("click", () => {
      const guardado = guardados.find((g) => g.id === tarjeta.dataset.id);
      if (guardado) restaurarOutfit(guardado);
      document.body.classList.remove("guardados-abierto");
      document.getElementById("panel-guardados").setAttribute("aria-hidden", "true");
    });
  });
}

function restaurarOutfit(guardado) {
  const idsPorCategoria = {
    gorras: guardado.gorra_id || "sin-gorro",
    remeras: guardado.remera_id,
    pantalones: guardado.pantalon_id,
    zapatillas: guardado.zapatilla_id,
  };

  ORDEN_CATEGORIAS.forEach((categoria, i) => {
    const cf = window.Ropero.coverflows[categoria];
    const id = idsPorCategoria[categoria];
    if (!cf || !id) return;
    const indice = cf.estado.items.findIndex((it) => it.id === id);
    if (indice < 0) return;
    setTimeout(() => cf.irA(indice), i * PASO_ANIMACION_MS);
  });
}
