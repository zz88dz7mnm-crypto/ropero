// Marcar outfit como favorito (botón cuadrado arriba a la derecha) + panel
// "Favoritos" (menú lateral) que muestra todas las combinaciones marcadas
// como fotitos y, al tocar una, anima las 4 filas hasta esa combinación
// (mismo estilo de animación escalonada que usa Generar).

const ORDEN_CATEGORIAS = ["gorras", "remeras", "pantalones", "zapatillas"];
const PASO_ANIMACION_MS = 380;

let favoritos = []; // filas tal cual vienen de la tabla outfits_favoritos
let mapaClaveAId = new Map(); // "gorraId|remeraId|pantalonId|zapatillaId" -> id del favorito

document.addEventListener("ropero:listo", inicializarFavoritos);

async function inicializarFavoritos() {
  favoritos = await listarFavoritos();
  reconstruirMapaClaves();

  const btnFavorito = document.getElementById("btn-favorito");
  btnFavorito.addEventListener("click", alternarFavorito);
  document.addEventListener("ropero:fila-asentada", () => actualizarBotonFavorito());
  actualizarBotonFavorito();

  inicializarPanelFavoritos();
}

function reconstruirMapaClaves() {
  mapaClaveAId = new Map();
  favoritos.forEach((f) => mapaClaveAId.set(clave(f), f.id));
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

function actualizarBotonFavorito() {
  const btnFavorito = document.getElementById("btn-favorito");
  const actual = outfitActual();
  const yaFavorito = actual && mapaClaveAId.has(clave(actual));
  btnFavorito.classList.toggle("activo", !!yaFavorito);
  btnFavorito.setAttribute("aria-pressed", yaFavorito ? "true" : "false");
}

async function alternarFavorito() {
  const actual = outfitActual();
  if (!actual) return;
  const k = clave(actual);
  const btnFavorito = document.getElementById("btn-favorito");

  if (mapaClaveAId.has(k)) {
    const id = mapaClaveAId.get(k);
    btnFavorito.classList.remove("activo");
    btnFavorito.setAttribute("aria-pressed", "false");
    try {
      await borrarFavorito(id);
      favoritos = favoritos.filter((f) => f.id !== id);
      mapaClaveAId.delete(k);
      renderizarGrillaFavoritos();
    } catch (err) {
      console.error("No se pudo borrar el favorito:", err);
      btnFavorito.classList.add("activo"); // revierte el toggle visual si falló
      btnFavorito.setAttribute("aria-pressed", "true");
    }
    return;
  }

  btnFavorito.classList.add("activo");
  btnFavorito.setAttribute("aria-pressed", "true");
  try {
    const nuevo = await crearFavorito(actual);
    favoritos.unshift(nuevo);
    mapaClaveAId.set(k, nuevo.id);
    renderizarGrillaFavoritos();
  } catch (err) {
    console.error("No se pudo guardar el favorito:", err);
    btnFavorito.classList.remove("activo");
    btnFavorito.setAttribute("aria-pressed", "false");
  }
}

// ===== Panel "Favoritos" =====

function inicializarPanelFavoritos() {
  const html = `
    <div id="overlay-favoritos" class="overlay-favoritos"></div>
    <div id="panel-favoritos" class="panel-favoritos" aria-hidden="true">
      <div class="panel-favoritos-header">
        <span class="panel-favoritos-titulo">Favoritos</span>
        <button id="btn-cerrar-favoritos" class="btn-cerrar-favoritos" aria-label="Cerrar">✕</button>
      </div>
      <div class="panel-favoritos-body">
        <div id="grilla-favoritos" class="grilla-favoritos"></div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", html);

  const overlay = document.getElementById("overlay-favoritos");
  const panel = document.getElementById("panel-favoritos");
  const btnCerrar = document.getElementById("btn-cerrar-favoritos");

  function abrir() {
    renderizarGrillaFavoritos();
    document.body.classList.add("favoritos-abierto");
    panel.setAttribute("aria-hidden", "false");
  }
  function cerrar() {
    document.body.classList.remove("favoritos-abierto");
    panel.setAttribute("aria-hidden", "true");
  }

  document.addEventListener("menu:accion", (ev) => {
    if (ev.detail.accion === "favoritos") abrir();
  });
  btnCerrar.addEventListener("click", cerrar);
  overlay.addEventListener("click", cerrar);
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") cerrar();
  });

  renderizarGrillaFavoritos();
}

function buscarPrenda(categoria, id) {
  if (!id) return null;
  return (window.Ropero.datos[categoria] || []).find((it) => it.id === id) || null;
}

function renderizarGrillaFavoritos() {
  const grilla = document.getElementById("grilla-favoritos");
  if (!grilla) return;

  if (!favoritos.length) {
    grilla.innerHTML = `<div class="favoritos-vacio">Todavía no marcaste ningún outfit como favorito.<br>Tocá el cuadradito de arriba a la derecha para marcar el que tenés armado.</div>`;
    return;
  }

  grilla.innerHTML = favoritos
    .map((f) => {
      const prendas = [
        buscarPrenda("gorras", f.gorra_id),
        buscarPrenda("remeras", f.remera_id),
        buscarPrenda("pantalones", f.pantalon_id),
        buscarPrenda("zapatillas", f.zapatilla_id),
      ].filter((p) => p && p.imagen_url);

      const imgs = prendas.map((p) => `<img src="${p.imagen_url}" alt="${p.nombre || ""}" draggable="false" />`).join("");
      return `<button class="tarjeta-favorito" data-id="${f.id}">${imgs}</button>`;
    })
    .join("");

  grilla.querySelectorAll(".tarjeta-favorito").forEach((tarjeta) => {
    tarjeta.addEventListener("click", () => {
      const favorito = favoritos.find((f) => f.id === tarjeta.dataset.id);
      if (favorito) restaurarOutfit(favorito);
      document.body.classList.remove("favoritos-abierto");
      document.getElementById("panel-favoritos").setAttribute("aria-hidden", "true");
    });
  });
}

function restaurarOutfit(favorito) {
  const idsPorCategoria = {
    gorras: favorito.gorra_id || "sin-gorro",
    remeras: favorito.remera_id,
    pantalones: favorito.pantalon_id,
    zapatillas: favorito.zapatilla_id,
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
