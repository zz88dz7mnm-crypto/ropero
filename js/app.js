// Coverflow de remeras: solo lectura/visual. La carga de remeras y sus tags
// (color/es, estilo/s, clima/s, corte, ocasiones, diseño, tipo de outfit) se hace
// aparte, directo en la base — acá no hay formulario a propósito.

const ESPACIADO = 165; // px entre el centro de una tarjeta y la siguiente

const state = {
  remeras: [],
  indiceActual: 0, // puede ser fraccionario mientras se arrastra
  arrastrando: false,
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  if (!supabaseConfigurado()) {
    mostrarVacio("Supabase no está configurado. Revisá js/config.js.");
    return;
  }

  state.remeras = await listarRemeras();

  if (!state.remeras.length) {
    mostrarVacio("Todavía no hay remeras cargadas.");
    return;
  }

  construirTarjetas();
  render(true);
  actualizarContador();
  habilitarGestos();
  habilitarTeclado();
}

function mostrarVacio(mensaje) {
  const div = document.createElement("div");
  div.className = "vacio-remeras";
  div.textContent = mensaje;
  document.body.appendChild(div);
}

function construirTarjetas() {
  const track = document.getElementById("track");
  track.innerHTML = "";
  state.remeras.forEach((remera, i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.index = i;
    card.innerHTML = `<img src="${remera.imagen_url}" alt="${remera.nombre || "Remera"}" draggable="false" />`;
    card.addEventListener("click", () => {
      if (state.arrastrando) return;
      irA(i);
    });
    track.appendChild(card);
  });
}

function render(inicial = false) {
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => {
    const i = Number(card.dataset.index);
    const offset = i - state.indiceActual;
    const dist = Math.min(Math.abs(offset), 4);

    const traslX = offset * ESPACIADO;
    const rotY = Math.max(-45, Math.min(45, offset * -40));
    const escala = Math.max(0.55, 1 - dist * 0.16);
    const opacidad = Math.max(0, 1 - dist * 0.32);
    const brillo = Math.max(0.3, 1 - dist * 0.22);
    const z = Math.round(100 - dist * 10);

    card.style.transform = `translateX(${traslX}px) translateZ(${-dist * 90}px) rotateY(${rotY}deg) scale(${escala})`;
    card.style.opacity = opacidad;
    card.style.filter = `brightness(${brillo})`;
    card.style.zIndex = z;
    card.style.pointerEvents = dist > 3.2 ? "none" : "auto";

    if (inicial) card.classList.remove("en-movimiento");
  });
}

function irA(indice) {
  state.indiceActual = Math.max(0, Math.min(state.remeras.length - 1, indice));
  document.querySelectorAll(".card").forEach((c) => c.classList.remove("en-movimiento"));
  render();
  actualizarContador();
}

function actualizarContador() {
  const cont = document.getElementById("contador");
  if (!cont || !state.remeras.length) return;
  cont.textContent = `${Math.round(state.indiceActual) + 1} / ${state.remeras.length}`;
}

function habilitarGestos() {
  const stage = document.getElementById("stage");
  let inicioX = 0;
  let indiceBase = 0;

  stage.addEventListener("pointerdown", (ev) => {
    state.arrastrando = true;
    inicioX = ev.clientX;
    indiceBase = state.indiceActual;
    stage.setPointerCapture(ev.pointerId);
    document.querySelectorAll(".card").forEach((c) => c.classList.add("en-movimiento"));
  });

  stage.addEventListener("pointermove", (ev) => {
    if (!state.arrastrando) return;
    const deltaX = ev.clientX - inicioX;
    let nuevoIndice = indiceBase - deltaX / ESPACIADO;
    nuevoIndice = Math.max(-0.6, Math.min(state.remeras.length - 1 + 0.6, nuevoIndice));
    state.indiceActual = nuevoIndice;
    render();
  });

  const soltar = () => {
    if (!state.arrastrando) return;
    state.arrastrando = false;
    document.querySelectorAll(".card").forEach((c) => c.classList.remove("en-movimiento"));
    irA(Math.round(state.indiceActual));
  };

  stage.addEventListener("pointerup", soltar);
  stage.addEventListener("pointercancel", soltar);
}

function habilitarTeclado() {
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "ArrowRight") irA(Math.round(state.indiceActual) + 1);
    if (ev.key === "ArrowLeft") irA(Math.round(state.indiceActual) - 1);
  });
}
