// Lógica de UI: tabs, render del ropero, armado de outfit y sugerencia de IA.

const state = {
  prendas: [],
  outfitEnArmado: [],
  indiceSwipe: 0,
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
}

function mostrarAvisoConfig() {
  const aviso = document.getElementById("aviso-config");
  aviso.classList.remove("oculto");
}

function cambiarTab(tab) {
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("activo", b.dataset.tab === tab));
  document.querySelectorAll(".tab-panel").forEach((p) => p.classList.toggle("oculto", p.id !== `panel-${tab}`));
  if (tab === "outfit") {
    state.indiceSwipe = 0;
    renderSwipe();
  }
}

async function cargarPrendas() {
  state.prendas = await listarPrendas();
  renderGridRopero();
  renderSwipe();
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

// --- Armado de outfit (swipe) ---

function renderSwipe() {
  const cont = document.getElementById("swipe-stack");
  const bandeja = document.getElementById("bandeja-outfit");
  if (!cont) return;

  const restantes = state.prendas.filter(
    (p) => !state.outfitEnArmado.some((o) => o.id === p.id)
  );

  if (state.indiceSwipe >= restantes.length) {
    cont.innerHTML = `<p class="vacio">No quedan más prendas para mostrar. Agregá más desde "Mi Ropero" o guardá el outfit.</p>`;
  } else {
    const prenda = restantes[state.indiceSwipe];
    cont.innerHTML = `
      <div class="swipe-card">
        <img src="${prenda.imagen_url}" alt="${prenda.nombre}" />
        <div class="prenda-info">
          <strong>${prenda.nombre}</strong>
          <span class="badge">${etiquetaCategoria(prenda.categoria)}</span>
        </div>
        <div class="swipe-botones">
          <button id="btn-descartar" class="btn-descartar">✕ Descartar</button>
          <button id="btn-agregar" class="btn-agregar">✓ Agregar al outfit</button>
        </div>
      </div>
    `;
    document.getElementById("btn-descartar").addEventListener("click", () => {
      state.indiceSwipe++;
      renderSwipe();
    });
    document.getElementById("btn-agregar").addEventListener("click", () => {
      state.outfitEnArmado.push(prenda);
      renderSwipe();
    });
  }

  bandeja.innerHTML = state.outfitEnArmado
    .map(
      (p) => `<div class="chip-prenda"><img src="${p.imagen_url}" alt="${p.nombre}" />${p.nombre}</div>`
    )
    .join("") || `<span class="vacio-chico">Sin prendas seleccionadas todavía.</span>`;
}

async function guardarOutfitActual() {
  if (!state.outfitEnArmado.length) {
    alert("Sumá al menos una prenda antes de guardar el outfit.");
    return;
  }
  const nombre = prompt("Nombre para este outfit:", "Outfit " + new Date().toLocaleDateString());
  if (nombre === null) return;

  try {
    await guardarOutfit({
      nombre,
      prenda_ids: state.outfitEnArmado.map((p) => p.id),
      contexto: {},
    });
    alert("Outfit guardado ✅");
    state.outfitEnArmado = [];
    state.indiceSwipe = 0;
    renderSwipe();
  } catch (e) {
    alert("Error guardando el outfit: " + e.message);
  }
}

// --- Sugerencia con IA (reglas + clima) ---

async function sugerirOutfitIA() {
  const cont = document.getElementById("resultado-ia");
  const ocasion = document.getElementById("input-ocasion").value;
  cont.innerHTML = `<p class="vacio">Consultando el clima y armando la sugerencia...</p>`;

  const clima = await obtenerClimaActual();
  const { prendas, motivo } = recomendarOutfit(state.prendas, {
    estacion: clima.estacion,
    condicion: clima.condicion,
    ocasion,
  });

  if (!prendas.length) {
    cont.innerHTML = `<p class="vacio">No encontré suficientes prendas cargadas para armar una combinación. Sumá más desde "Mi Ropero".</p>`;
    return;
  }

  cont.innerHTML = `
    <p class="motivo-ia">${motivo}${clima.temperatura !== null ? ` (${Math.round(clima.temperatura)}°C)` : ""}</p>
    <div class="grid-sugerencia">
      ${prendas
        .map(
          (p) => `
        <div class="prenda-card">
          <img src="${p.imagen_url}" alt="${p.nombre}" />
          <div class="prenda-info">
            <strong>${p.nombre}</strong>
            <span class="badge">${etiquetaCategoria(p.categoria)}</span>
          </div>
        </div>`
        )
        .join("")}
    </div>
  `;
}
