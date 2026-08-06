// Lógica de UI: tabs, render del ropero, armado de outfit y sugerencia de IA.

const state = {
  prendas: [],
  lienzo: [], // items en el lienzo: { uid, prenda, x, y, z } (x/y en % del lienzo)
  zTope: 1,
};

const CATEGORIAS = [
  { value: "remera", label: "Remera" },
  { value: "buzo", label: "Buzo / Sweater" },
  { value: "pantalon", label: "Pantalón" },
  { value: "short", label: "Short" },
  { value: "pollera", label: "Pollera" },
  { value: "vestido", label: "Vestido" },
  { value: "abrigo", label: "Abrigo / Campera" },
  { value: "calzado", label: "Calzado" },
  { value: "accesorio", label: "Accesorio" },
];

const ESTACIONES = [
  { value: "verano", label: "Verano" },
  { value: "otonio", label: "Otoño" },
  { value: "invierno", label: "Invierno" },
  { value: "primavera", label: "Primavera" },
];

document.addEventListener("DOMContentLoaded", init);

function init() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => cambiarTab(btn.dataset.tab));
  });

  renderFormularioNuevaPrenda();

  if (!supabaseConfigurado()) {
    mostrarAvisoConfig();
    return;
  }

  cargarPrendas();

  document.getElementById("btn-guardar-outfit").addEventListener("click", guardarOutfitActual);
  document.getElementById("btn-sugerir").addEventListener("click", sugerirOutfitIA);

  document.getElementById("btn-abrir-picker").addEventListener("click", abrirPicker);
  document.getElementById("btn-cerrar-picker").addEventListener("click", cerrarPicker);
  document.getElementById("picker-overlay").addEventListener("click", (ev) => {
    if (ev.target.id === "picker-overlay") cerrarPicker();
  });
  document.getElementById("btn-reset-lienzo").addEventListener("click", () => {
    if (!state.lienzo.length) return;
    if (confirm("¿Vaciar el lienzo?")) {
      state.lienzo = [];
      renderLienzo();
    }
  });
}

function mostrarAvisoConfig() {
  const aviso = document.getElementById("aviso-config");
  aviso.classList.remove("oculto");
}

function cambiarTab(tab) {
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("activo", b.dataset.tab === tab));
  document.querySelectorAll(".tab-panel").forEach((p) => p.classList.toggle("oculto", p.id !== `panel-${tab}`));
  if (tab === "outfit") renderLienzo();
  if (tab === "ia") renderCarruseles();
}

async function cargarPrendas() {
  state.prendas = await listarPrendas();
  renderGridRopero();
  renderLienzo();
  renderCarruseles();
}

function renderGridRopero() {
  const cont = document.getElementById("grid-ropero");
  cont.innerHTML = "";

  if (!state.prendas.length) {
    cont.innerHTML = `<p class="vacio">Todavía no cargaste ninguna prenda. Usá el formulario de arriba para sumar la primera.</p>`;
    return;
  }

  for (const prenda of state.prendas) {
    const card = document.createElement("div");
    card.className = "prenda-card";
    card.innerHTML = `
      <img src="${prenda.imagen_url}" alt="${prenda.nombre}" loading="lazy" />
      <div class="prenda-info">
        <strong>${prenda.nombre}</strong>
        <span class="badge">${etiquetaCategoria(prenda.categoria)}</span>
        <span class="tags">${(prenda.estaciones || []).join(", ")}</span>
        <span class="tags">${prenda.formalidad}</span>
      </div>
      <button class="btn-borrar" title="Eliminar">✕</button>
    `;
    card.querySelector(".btn-borrar").addEventListener("click", async () => {
      await eliminarPrenda(prenda.id);
      await cargarPrendas();
    });
    cont.appendChild(card);
  }
}

function etiquetaCategoria(valor) {
  return CATEGORIAS.find((c) => c.value === valor)?.label || valor;
}

function renderFormularioNuevaPrenda() {
  const selectCategoria = document.getElementById("input-categoria");
  selectCategoria.innerHTML = CATEGORIAS.map((c) => `<option value="${c.value}">${c.label}</option>`).join("");

  const contEstaciones = document.getElementById("input-estaciones");
  contEstaciones.innerHTML = ESTACIONES.map(
    (e) => `
      <label class="chk">
        <input type="checkbox" value="${e.value}" /> ${e.label}
      </label>`
  ).join("");

  document.getElementById("form-prenda").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const nombre = document.getElementById("input-nombre").value.trim();
    const categoria = selectCategoria.value;
    const color = document.getElementById("input-color").value.trim();
    const formalidad = document.getElementById("input-formalidad").value;
    const imagenUrl = document.getElementById("input-imagen").value.trim();
    const estaciones = Array.from(contEstaciones.querySelectorAll("input:checked")).map((i) => i.value);

    if (!nombre || !imagenUrl) {
      alert("Completá al menos el nombre y la URL de la imagen.");
      return;
    }

    try {
      await crearPrenda({ nombre, categoria, color, formalidad, estaciones, imagen_url: imagenUrl });
      ev.target.reset();
      await cargarPrendas();
    } catch (e) {
      alert("Error guardando la prenda: " + e.message);
    }
  });
}

// --- Armado de outfit (lienzo tipo moodboard, arrastrable) ---

function abrirPicker() {
  const grid = document.getElementById("picker-grid");
  grid.innerHTML = "";

  if (!state.prendas.length) {
    grid.innerHTML = `<p class="vacio">Todavía no tenés prendas cargadas. Sumá desde "Mi Ropero".</p>`;
  } else {
    for (const prenda of state.prendas) {
      const card = document.createElement("div");
      card.className = "prenda-card";
      card.innerHTML = `
        <img src="${prenda.imagen_url}" alt="${prenda.nombre}" loading="lazy" />
        <div class="prenda-info">
          <strong>${prenda.nombre}</strong>
          <span class="badge">${etiquetaCategoria(prenda.categoria)}</span>
        </div>
      `;
      card.addEventListener("click", () => agregarAlLienzo(prenda));
      grid.appendChild(card);
    }
  }

  document.getElementById("picker-overlay").classList.remove("oculto");
}

function cerrarPicker() {
  document.getElementById("picker-overlay").classList.add("oculto");
}

function agregarAlLienzo(prenda) {
  const cantidad = state.lienzo.length;
  state.lienzo.push({
    uid: crypto.randomUUID(),
    prenda,
    x: 15 + (cantidad % 3) * 12, // % desde la izquierda, escalonado
    y: 10 + (cantidad % 4) * 14, // % desde arriba, escalonado
    z: ++state.zTope,
  });
  renderLienzo();
}

function renderLienzo() {
  const cont = document.getElementById("lienzo");
  if (!cont) return;

  cont.querySelectorAll(".lienzo-item").forEach((el) => el.remove());

  const vacio = document.getElementById("lienzo-vacio");
  vacio.classList.toggle("oculto", state.lienzo.length > 0);

  for (const item of state.lienzo) {
    const el = document.createElement("div");
    el.className = "lienzo-item";
    el.style.left = item.x + "%";
    el.style.top = item.y + "%";
    el.style.zIndex = item.z;
    el.innerHTML = `
      <div class="tarjeta-prenda-lienzo">
        <img src="${item.prenda.imagen_url}" alt="${item.prenda.nombre}" />
      </div>
      <button class="btn-quitar-lienzo">✕</button>
    `;

    el.querySelector(".btn-quitar-lienzo").addEventListener("click", (ev) => {
      ev.stopPropagation();
      state.lienzo = state.lienzo.filter((i) => i.uid !== item.uid);
      renderLienzo();
    });

    habilitarArrastre(el, item, cont);
    cont.appendChild(el);
  }
}

function habilitarArrastre(el, item, canvas) {
  el.addEventListener("pointerdown", (ev) => {
    ev.preventDefault();
    el.setPointerCapture(ev.pointerId);
    el.classList.add("arrastrando");
    item.z = ++state.zTope;
    el.style.zIndex = item.z;

    const rectCanvas = canvas.getBoundingClientRect();

    const mover = (moveEv) => {
      let x = ((moveEv.clientX - rectCanvas.left) / rectCanvas.width) * 100;
      let y = ((moveEv.clientY - rectCanvas.top) / rectCanvas.height) * 100;
      x = Math.max(0, Math.min(88, x));
      y = Math.max(0, Math.min(85, y));
      item.x = x;
      item.y = y;
      el.style.left = x + "%";
      el.style.top = y + "%";
    };

    const soltar = () => {
      el.classList.remove("arrastrando");
      el.removeEventListener("pointermove", mover);
      el.removeEventListener("pointerup", soltar);
      el.removeEventListener("pointercancel", soltar);
    };

    el.addEventListener("pointermove", mover);
    el.addEventListener("pointerup", soltar);
    el.addEventListener("pointercancel", soltar);
  });
}

async function guardarOutfitActual() {
  if (!state.lienzo.length) {
    alert("Sumá al menos una prenda al lienzo antes de guardar el outfit.");
    return;
  }
  const nombre = prompt("Nombre para este outfit:", "Outfit " + new Date().toLocaleDateString());
  if (nombre === null) return;

  try {
    await guardarOutfit({
      nombre,
      prenda_ids: state.lienzo.map((i) => i.prenda.id),
      contexto: {},
      layout: state.lienzo.map((i) => ({ prenda_id: i.prenda.id, x: i.x, y: i.y, z: i.z })),
    });
    alert("Outfit guardado ✅");
  } catch (e) {
    alert("Error guardando el outfit: " + e.message);
  }
}

// --- Carruseles por categoría + Generar (reglas + clima) ---

let state_ultimoGenerado = [];

function renderCarruseles() {
  const cont = document.getElementById("carruseles-categorias");
  if (!cont) return;
  cont.innerHTML = "";

  for (const cat of CATEGORIAS) {
    const items = state.prendas.filter((p) => p.categoria === cat.value);
    if (!items.length) continue;

    const row = document.createElement("div");
    row.className = "carrusel-row";
    row.innerHTML = `
      <h4>${cat.label}</h4>
      <div class="carrusel-track" data-categoria="${cat.value}">
        ${items
          .map(
            (p) => `
          <div class="carrusel-card" data-id="${p.id}">
            <img src="${p.imagen_url}" alt="${p.nombre}" loading="lazy" />
            <span>${p.nombre}</span>
          </div>`
          )
          .join("")}
      </div>
    `;
    cont.appendChild(row);

    const track = row.querySelector(".carrusel-track");
    marcarCardCentrada(track);
    track.addEventListener("scroll", () => marcarCardCentrada(track), { passive: true });
  }

  if (!cont.children.length) {
    cont.innerHTML = `<p class="vacio">Cargá prendas en "Mi Ropero" para poder generar combinaciones.</p>`;
  }
}

function marcarCardCentrada(track) {
  const centroTrack = track.getBoundingClientRect().left + track.clientWidth / 2;
  let masCercana = null;
  let distMin = Infinity;
  track.querySelectorAll(".carrusel-card").forEach((card) => {
    const centroCard = card.getBoundingClientRect().left + card.offsetWidth / 2;
    const dist = Math.abs(centroCard - centroTrack);
    card.classList.remove("activa");
    if (dist < distMin) {
      distMin = dist;
      masCercana = card;
    }
  });
  if (masCercana) masCercana.classList.add("activa");
}

async function sugerirOutfitIA() {
  const resultado = document.getElementById("resultado-ia");
  const ocasion = document.getElementById("input-ocasion").value;
  resultado.innerHTML = `<p class="vacio">Consultando el clima y armando la combinación...</p>`;

  const clima = await obtenerClimaActual();
  const { prendas, motivo } = recomendarOutfit(state.prendas, {
    estacion: clima.estacion,
    condicion: clima.condicion,
    ocasion,
  });

  if (!prendas.length) {
    resultado.innerHTML = `<p class="vacio">No encontré suficientes prendas para armar una combinación. Sumá más desde "Mi Ropero".</p>`;
    return;
  }

  // Desliza cada carrusel hasta la prenda elegida, una fila después de otra.
  prendas.forEach((prenda, i) => {
    setTimeout(() => {
      const track = document.querySelector(`.carrusel-track[data-categoria="${prenda.categoria}"]`);
      const card = track?.querySelector(`.carrusel-card[data-id="${prenda.id}"]`);
      card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }, i * 350);
  });

  state_ultimoGenerado = prendas;

  const demora = prendas.length * 350 + 300;
  setTimeout(() => {
    resultado.innerHTML = `
      <p class="motivo-ia">${motivo}${clima.temperatura !== null ? ` (${Math.round(clima.temperatura)}°C)` : ""}</p>
      <button id="btn-guardar-generado" class="btn-primario btn-guardar-generado">Guardar este outfit</button>
    `;
    document.getElementById("btn-guardar-generado").addEventListener("click", guardarOutfitGenerado);
  }, demora);
}

async function guardarOutfitGenerado() {
  if (!state_ultimoGenerado.length) return;
  const nombre = prompt("Nombre para este outfit:", "Outfit " + new Date().toLocaleDateString());
  if (nombre === null) return;
  try {
    await guardarOutfit({
      nombre,
      prenda_ids: state_ultimoGenerado.map((p) => p.id),
      contexto: {},
    });
    alert("Outfit guardado ✅");
  } catch (e) {
    alert("Error guardando el outfit: " + e.message);
  }
}
