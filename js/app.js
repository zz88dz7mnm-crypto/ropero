// Cuatro coverflows independientes (gorra / remera / pantalón / zapatilla)
// que comparten el mismo eje central para poder armar combinaciones. Las
// imágenes se usan tal cual las carga cada prenda (sin recortar ni editar);
// el tamaño de cada fila se controla solo por CSS (ver style.css). Solo
// lectura: la carga de prendas y sus tags se hace aparte, directo en la base.

const ESPACIADO = 165; // px entre el centro de una prenda y la siguiente
const SENSIBILIDAD_RUEDA = 1; // qué tan rápido responde el trackpad

// No editamos ninguna imagen (van tal cual las carga cada prenda), pero cada
// foto trae distinto margen/encuadre alrededor del objeto, así que a igual
// "height" de CSS se ven de tamaño distinto. Estos valores fijan la altura
// de cada imagen puntual para que el ANCHO real (lo que se lee como tamaño)
// quede parejo entre gorras y entre zapatillas. Es solo tamaño de
// visualización, no toca el archivo.
const ALTURA_VH_DESKTOP = {
  "img/gorras/padres-marron.png": 14.4,
  "img/gorras/negra-lisa.png": 7.434,
  "img/gorras/yankees-roja.png": 7.506,
  "img/zapatillas/vans-skhi-negra.png": 12.1,
  "img/zapatillas/timberland-miel.png": 10.02,
  "img/zapatillas/vans-halfcab-negra.png": 19.5,
};

const ALTURA_VH_MOBILE = {
  "img/gorras/padres-marron.png": 11.952,
  "img/gorras/negra-lisa.png": 6.174,
  "img/gorras/yankees-roja.png": 6.228,
  "img/zapatillas/vans-skhi-negra.png": 10.05,
  "img/zapatillas/timberland-miel.png": 8.32,
  "img/zapatillas/vans-halfcab-negra.png": 16.19,
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  if (!supabaseConfigurado()) {
    mostrarVacio("fila-gorras", "Supabase no está configurado. Revisá js/config.js.");
    mostrarVacio("fila-remeras", "Supabase no está configurado. Revisá js/config.js.");
    mostrarVacio("fila-pantalones", "Supabase no está configurado. Revisá js/config.js.");
    mostrarVacio("fila-zapatillas", "Supabase no está configurado. Revisá js/config.js.");
    return;
  }

  const [gorras, remeras, pantalones, zapatillas] = await Promise.all([
    listarGorras(),
    listarRemeras(),
    listarPantalones(),
    listarZapatillas(),
  ]);

  // La gorra es opcional: sumamos un slot "sin gorro" (sin imagen) como
  // primera opción del carrusel, para poder armar el outfit sin gorra.
  const gorrasConVacio = [{ id: "sin-gorro", nombre: "Sin gorro", imagen_url: null }, ...gorras];

  montarFila("fila-gorras", "stage-gorras", "track-gorras", gorrasConVacio, "Todavía no hay gorras cargadas.");
  montarFila("fila-remeras", "stage-remeras", "track-remeras", remeras, "Todavía no hay remeras cargadas.");
  montarFila("fila-pantalones", "stage-pantalones", "track-pantalones", pantalones, "Todavía no hay pantalones cargados.");
  montarFila("fila-zapatillas", "stage-zapatillas", "track-zapatillas", zapatillas, "Todavía no hay zapatillas cargadas.");
}

function montarFila(filaId, stageId, trackId, items, mensajeVacio) {
  if (!items.length) {
    mostrarVacio(filaId, mensajeVacio);
    return;
  }
  const trackEl = document.getElementById(trackId);
  const stageEl = document.getElementById(stageId);
  const cf = crearCoverflow(trackEl, items);
  cf.construir();
  cf.render(true);
  habilitarGestos(stageEl, cf);
}

function mostrarVacio(filaId, mensaje) {
  const fila = document.getElementById(filaId);
  if (!fila) return;
  const div = document.createElement("div");
  div.className = "vacio-fila";
  div.textContent = mensaje;
  fila.appendChild(div);
}

function crearCoverflow(trackEl, items) {
  const estado = { items, indiceActual: 0, arrastrando: false };

  function construir() {
    trackEl.innerHTML = "";
    items.forEach((item, i) => {
      const card = document.createElement("div");
      const esVacio = !item.imagen_url;
      card.className = esVacio ? "card vacio-gorra" : "card";
      card.dataset.index = i;
      if (!esVacio) {
        card.innerHTML = `<img src="${item.imagen_url}" alt="${item.nombre || ""}" draggable="false" />`;
        const tabla = window.matchMedia("(max-width: 600px)").matches ? ALTURA_VH_MOBILE : ALTURA_VH_DESKTOP;
        const alto = tabla[item.imagen_url];
        if (alto) card.querySelector("img").style.height = alto + "vh";
      }
      card.addEventListener("click", () => {
        if (estado.arrastrando) return;
        irA(i);
      });
      trackEl.appendChild(card);
    });
  }

  function render(inicial = false) {
    trackEl.querySelectorAll(".card").forEach((card) => {
      const i = Number(card.dataset.index);
      const offset = i - estado.indiceActual;
      const dist = Math.min(Math.abs(offset), 4);

      const traslX = offset * ESPACIADO;
      const rotY = Math.max(-45, Math.min(45, offset * -40));
      const escala = Math.max(0.55, 1 - dist * 0.16);
      const opacidad = Math.max(0, 1 - dist * 0.32);
      const brillo = Math.max(0.3, 1 - dist * 0.22);
      const z = Math.round(100 - dist * 10);

      card.style.transform = `translate(-50%, -50%) translateX(${traslX}px) translateZ(${-dist * 90}px) rotateY(${rotY}deg) scale(${escala})`;
      card.style.opacity = opacidad;
      card.style.filter = `brightness(${brillo})`;
      card.style.zIndex = z;
      card.style.pointerEvents = dist > 3.2 ? "none" : "auto";

      if (inicial) card.classList.remove("en-movimiento");
    });
  }

  function irA(indice) {
    estado.indiceActual = Math.max(0, Math.min(items.length - 1, indice));
    trackEl.querySelectorAll(".card").forEach((c) => c.classList.remove("en-movimiento"));
    render();
  }

  return { estado, construir, render, irA };
}

function habilitarGestos(stageEl, cf) {
  let inicioX = 0;
  let indiceBase = 0;

  const marcarMoviendo = (activo) => {
    stageEl.querySelectorAll(".card").forEach((c) => c.classList.toggle("en-movimiento", activo));
  };

  stageEl.addEventListener("pointerdown", (ev) => {
    cf.estado.arrastrando = true;
    inicioX = ev.clientX;
    indiceBase = cf.estado.indiceActual;
    stageEl.setPointerCapture(ev.pointerId);
    marcarMoviendo(true);
  });

  stageEl.addEventListener("pointermove", (ev) => {
    if (!cf.estado.arrastrando) return;
    const deltaX = ev.clientX - inicioX;
    let nuevo = indiceBase - deltaX / ESPACIADO;
    nuevo = Math.max(-0.6, Math.min(cf.estado.items.length - 1 + 0.6, nuevo));
    cf.estado.indiceActual = nuevo;
    cf.render();
  });

  const soltar = () => {
    if (!cf.estado.arrastrando) return;
    cf.estado.arrastrando = false;
    marcarMoviendo(false);
    cf.irA(Math.round(cf.estado.indiceActual));
  };
  stageEl.addEventListener("pointerup", soltar);
  stageEl.addEventListener("pointercancel", soltar);

  // Trackpad: gesto de dos dedos (deltaX de "wheel"). Se ignora si hay
  // ctrlKey (eso es pinch-to-zoom) para no interferir con el zoom del navegador.
  let temporizadorRueda = null;
  stageEl.addEventListener(
    "wheel",
    (ev) => {
      if (ev.ctrlKey) return;
      const delta = Math.abs(ev.deltaX) >= Math.abs(ev.deltaY) ? ev.deltaX : ev.deltaY;
      if (!delta) return;
      ev.preventDefault();
      marcarMoviendo(true);

      let nuevo = cf.estado.indiceActual + (delta / ESPACIADO) * SENSIBILIDAD_RUEDA;
      nuevo = Math.max(0, Math.min(cf.estado.items.length - 1, nuevo));
      cf.estado.indiceActual = nuevo;
      cf.render();

      clearTimeout(temporizadorRueda);
      temporizadorRueda = setTimeout(() => {
        marcarMoviendo(false);
        cf.irA(Math.round(cf.estado.indiceActual));
      }, 120);
    },
    { passive: false }
  );
}
