// Widget "rueda semicircular": un bump chico pegado al borde derecho de la
// pantalla que, al tocarlo, expande un arco de opciones (círculos). Arrastrar
// verticalmente rota el arco — mismo patrón de arrastre/snap que ya usan los
// coverflows de app.js (indiceActual continuo, se redondea al soltar), pero
// mapeado a un ángulo sobre un círculo imaginario centrado fuera de la
// pantalla en vez de a una traslación horizontal. Por eso "solo se ve la
// mitad": los ángulos más allá de +-95° quedan clampeados/invisibles.
//
// Genérico a propósito: se instancia una vez por rueda (hoy: accesorios y
// camperas/abrigo, ambas con círculos rojos de prueba — todavía no hay fotos
// reales de ninguna de las dos). El día que haya fotos reales, cada "opción"
// simplemente lleva `imagen_url` en vez de `color` y se muestra igual.

const RUEDA_RADIO = 128; // px, radio del círculo imaginario
const RUEDA_PASO_GRADOS = 26; // separación angular entre opciones
const RUEDA_ESPACIADO_PX = 70; // px de arrastre vertical = "pasar una opción"

function crearRuedaSemicircular({ id, top, opciones, onElegir }) {
  const html = `
    <div class="rueda-wrap" id="rueda-${id}" style="top:${top}">
      <button class="rueda-bump" id="rueda-bump-${id}" aria-label="Abrir selector" aria-expanded="false"></button>
      <div class="rueda-arco" id="rueda-arco-${id}"></div>
    </div>
    <button class="rueda-flotante" id="rueda-flotante-${id}" aria-hidden="true" aria-label="Quitar"></button>
  `;
  document.body.insertAdjacentHTML("beforeend", html);

  const wrap = document.getElementById(`rueda-${id}`);
  const bump = document.getElementById(`rueda-bump-${id}`);
  const arco = document.getElementById(`rueda-arco-${id}`);
  const flotante = document.getElementById(`rueda-flotante-${id}`);

  const estado = { indiceActual: 0, arrastrando: false, total: opciones.length };

  opciones.forEach((op, i) => {
    const dot = document.createElement("div");
    dot.className = "rueda-opcion";
    dot.dataset.index = i;
    if (op.imagen_url) {
      dot.innerHTML = `<img src="${op.imagen_url}" alt="${op.nombre || ""}" draggable="false" />`;
    } else {
      dot.style.background = op.color || "#e11d2e";
    }
    dot.addEventListener("click", (ev) => {
      ev.stopPropagation();
      if (wrap.dataset.arrastrando === "true") return;
      elegir(i);
    });
    arco.appendChild(dot);
  });

  function render(inicial = false) {
    arco.querySelectorAll(".rueda-opcion").forEach((dot) => {
      const i = Number(dot.dataset.index);
      const offset = i - estado.indiceActual;
      const dist = Math.min(Math.abs(offset), 4);
      const angulo = Math.max(-96, Math.min(96, offset * RUEDA_PASO_GRADOS));
      const rad = (angulo * Math.PI) / 180;
      const tx = -Math.cos(rad) * RUEDA_RADIO;
      const ty = Math.sin(rad) * RUEDA_RADIO;
      const escala = Math.max(0.42, 1 - dist * 0.17);
      const opacidad = Math.max(0, 1 - dist * 0.32);

      dot.style.transform = `translate(${tx}px, ${ty}px) scale(${escala})`;
      dot.style.opacity = opacidad;
      dot.style.zIndex = String(Math.round(100 - dist * 10));
      dot.style.pointerEvents = dist > 3.2 ? "none" : "auto";
      if (inicial) dot.classList.remove("en-movimiento");
    });
  }

  function irA(indice) {
    estado.indiceActual = Math.max(0, Math.min(estado.total - 1, indice));
    arco.querySelectorAll(".rueda-opcion").forEach((d) => d.classList.remove("en-movimiento"));
    render();
  }

  function tick() {
    if (navigator.vibrate) navigator.vibrate(8);
    const frente = arco.querySelector(`.rueda-opcion[data-index="${Math.round(estado.indiceActual)}"]`);
    if (!frente) return;
    frente.classList.add("rueda-tick");
    setTimeout(() => frente.classList.remove("rueda-tick"), 220);
  }

  function marcarMoviendo(activo) {
    arco.querySelectorAll(".rueda-opcion").forEach((d) => d.classList.toggle("en-movimiento", activo));
  }

  function abrir() {
    wrap.classList.add("expandida");
    bump.setAttribute("aria-expanded", "true");
    render(true);
  }
  function cerrar() {
    wrap.classList.remove("expandida");
    bump.setAttribute("aria-expanded", "false");
    // render() deja opacity/pointer-events puestos inline (pisan el default
    // de la clase CSS) — sin esto, los puntitos quedan visibles después de
    // colapsar aunque el wrap ya no tenga la clase "expandida".
    arco.querySelectorAll(".rueda-opcion").forEach((dot) => {
      dot.style.opacity = "0";
      dot.style.pointerEvents = "none";
    });
  }

  bump.addEventListener("click", () => {
    if (wrap.classList.contains("expandida")) cerrar();
    else abrir();
  });

  // Arrastre vertical = rotación (mismo patrón que habilitarGestos en app.js,
  // eje Y en vez de X, ángulo en vez de traslación lineal).
  let inicioY = 0;
  let indiceBase = 0;

  wrap.addEventListener("pointerdown", (ev) => {
    if (!wrap.classList.contains("expandida")) return;
    wrap.dataset.arrastrando = "true";
    inicioY = ev.clientY;
    indiceBase = estado.indiceActual;
    wrap.setPointerCapture(ev.pointerId);
    marcarMoviendo(true);
  });

  wrap.addEventListener("pointermove", (ev) => {
    if (wrap.dataset.arrastrando !== "true") return;
    const deltaY = ev.clientY - inicioY;
    let nuevo = indiceBase + deltaY / RUEDA_ESPACIADO_PX;
    nuevo = Math.max(-0.6, Math.min(estado.total - 1 + 0.6, nuevo));
    const anterior = Math.round(estado.indiceActual);
    estado.indiceActual = nuevo;
    render();
    if (Math.round(nuevo) !== anterior) tick();
  });

  const soltar = () => {
    if (wrap.dataset.arrastrando !== "true") return;
    wrap.dataset.arrastrando = "false";
    marcarMoviendo(false);
    irA(Math.round(estado.indiceActual));
  };
  wrap.addEventListener("pointerup", soltar);
  wrap.addEventListener("pointercancel", soltar);

  function elegir(i) {
    irA(i);
    const opcion = opciones[i];
    cerrar();
    mostrarFlotante(opcion);
    if (onElegir) onElegir(opcion);
  }

  function mostrarFlotante(opcion) {
    if (opcion.imagen_url) {
      flotante.style.background = "transparent";
      flotante.innerHTML = `<img src="${opcion.imagen_url}" alt="${opcion.nombre || ""}" draggable="false" />`;
    } else {
      flotante.style.background = opcion.color || "#e11d2e";
      flotante.innerHTML = "";
    }
    flotante.classList.add("activo");
    flotante.setAttribute("aria-hidden", "false");
  }

  flotante.addEventListener("click", () => {
    flotante.classList.remove("activo");
    flotante.setAttribute("aria-hidden", "true");
  });

  return { estado, irA, elegir };
}
