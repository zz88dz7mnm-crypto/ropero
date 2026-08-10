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

const RUEDA_RADIO = 150; // px, radio del círculo imaginario (subido de 128 para dar lugar a puntos más grandes sin que se pisen)
const RUEDA_PASO_GRADOS = 27; // separación angular entre opciones
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
    // Prenda real (ej. campera): nada de recorte circular acá tampoco — la
    // gracia es ver la prenda flotando en el arco, no un círculo genérico.
    // Un poco más grande que el círculo de accesorio (44px), pero más chica
    // que el flotante "posado" (conviven varias a la vez en el arco).
    if (op.dotAlturaPx) {
      dot.classList.add("prenda-real");
      dot.style.height = `${op.dotAlturaPx}px`;
    }
    arco.appendChild(dot);
  });
  // La selección NO se maneja con "click" en cada punto: junto con
  // setPointerCapture (necesario para que el arrastre no se corte si el
  // mouse sale del wrap), el click nativo del navegador queda poco confiable
  // en compu — `ev.target` del pointerup deja de reflejar el elemento real
  // bajo el cursor una vez que hay captura activa. Por eso el pointerup de
  // más abajo resuelve la selección a mano con elementFromPoint().

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

      // translate(-50%,-50%) primero: centra la caja en su propio punto de
      // anclaje sin importar el tamaño (antes era un margin fijo de -22px,
      // que solo daba bien para el círculo de 44px de accesorios — con los
      // puntos de campera midiendo distinto cada uno, hacía falta esto).
      dot.style.transform = `translate(-50%, -50%) translate(${tx}px, ${ty}px) scale(${escala})`;
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
    frente.classList.remove("rueda-tick");
    void frente.offsetWidth; // fuerza reflow: si ya tenía la clase (ticks rápidos seguidos), reinicia la animación
    frente.classList.add("rueda-tick");
    setTimeout(() => frente.classList.remove("rueda-tick"), 240);
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
  // eje Y en vez de X, ángulo en vez de traslación lineal). Igual que un
  // click normal no dispara "drag" hasta que el mouse se mueve unos pixeles
  // de verdad, acá se espera un umbral (UMBRAL_DRAG_PX) antes de empezar a
  // rotar — sin esto, hasta el temblor mínimo de la mano al clickear ya
  // giraba la rueda un poquito, y se sentía tosco/impreciso.
  const UMBRAL_DRAG_PX = 6;
  let inicioX = 0;
  let inicioY = 0;
  let indiceBase = 0;
  let moviendoseDeVerdad = false;

  wrap.addEventListener("pointerdown", (ev) => {
    if (!wrap.classList.contains("expandida")) return;
    wrap.dataset.arrastrando = "pendiente"; // todavia no se sabe si es click o drag
    inicioX = ev.clientX;
    inicioY = ev.clientY;
    indiceBase = estado.indiceActual;
    moviendoseDeVerdad = false;
    wrap.setPointerCapture(ev.pointerId);
  });

  wrap.addEventListener("pointermove", (ev) => {
    if (wrap.dataset.arrastrando !== "pendiente" && wrap.dataset.arrastrando !== "true") return;
    const deltaY = ev.clientY - inicioY;
    const deltaX = ev.clientX - inicioX;

    if (!moviendoseDeVerdad) {
      if (Math.hypot(deltaX, deltaY) < UMBRAL_DRAG_PX) return; // todavía podría ser un click
      moviendoseDeVerdad = true;
      wrap.dataset.arrastrando = "true";
      marcarMoviendo(true);
    }

    let nuevo = indiceBase + deltaY / RUEDA_ESPACIADO_PX;
    nuevo = Math.max(-0.6, Math.min(estado.total - 1 + 0.6, nuevo));
    const anterior = Math.round(estado.indiceActual);
    estado.indiceActual = nuevo;
    render();
    if (Math.round(nuevo) !== anterior) tick();
  });

  const soltar = (ev) => {
    if (wrap.dataset.arrastrando !== "pendiente" && wrap.dataset.arrastrando !== "true") return;
    const fueArrastre = moviendoseDeVerdad;
    wrap.dataset.arrastrando = "false";
    marcarMoviendo(false);

    if (fueArrastre) {
      irA(Math.round(estado.indiceActual));
      return;
    }
    // No se movió lo suficiente como para contar como arrastre: es un
    // click/tap. Con la captura de puntero activa, ev.target ya no sirve
    // para saber qué hay bajo el cursor — se resuelve con un hit-test real.
    const bajoElCursor = document.elementFromPoint(ev.clientX, ev.clientY);
    const opcion = bajoElCursor && bajoElCursor.closest(".rueda-opcion");
    if (opcion) elegir(Number(opcion.dataset.index));
  };
  wrap.addEventListener("pointerup", soltar);
  wrap.addEventListener("pointercancel", () => {
    wrap.dataset.arrastrando = "false";
    marcarMoviendo(false);
  });

  // Trackpad: gesto de dos dedos arriba/abajo (deltaY de "wheel") — mismo
  // patrón que ya usan los coverflows principales en app.js, pero con
  // deltaY derecho (acá la rotación ya es vertical) en vez de elegir el eje
  // más grande. Se ignora si hay ctrlKey (eso es pinch-to-zoom).
  let temporizadorRueda = null;
  wrap.addEventListener(
    "wheel",
    (ev) => {
      if (!wrap.classList.contains("expandida")) return;
      if (ev.ctrlKey || !ev.deltaY) return;
      ev.preventDefault();
      marcarMoviendo(true);

      let nuevo = estado.indiceActual + ev.deltaY / RUEDA_ESPACIADO_PX;
      nuevo = Math.max(0, Math.min(estado.total - 1, nuevo));
      const anterior = Math.round(estado.indiceActual);
      estado.indiceActual = nuevo;
      render();
      if (Math.round(nuevo) !== anterior) tick();

      clearTimeout(temporizadorRueda);
      temporizadorRueda = setTimeout(() => {
        marcarMoviendo(false);
        irA(Math.round(estado.indiceActual));
      }, 120);
    },
    { passive: false }
  );

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

    // Prenda real (ej. campera): altura propia por foto (mismo criterio de
    // calibración de tamaño que gorras/zapatillas — canal alpha + ancho),
    // sin el recorte circular de 34px que usan los accesorios chicos.
    const esPrendaReal = !!(opcion.alturaDesktopVh || opcion.alturaMobileVh);
    flotante.classList.toggle("prenda-real", esPrendaReal);
    if (esPrendaReal) {
      const esMobile = window.matchMedia("(max-width: 600px)").matches;
      const altura = esMobile ? opcion.alturaMobileVh : opcion.alturaDesktopVh;
      flotante.style.height = `${altura}vh`;
    } else {
      flotante.style.height = "";
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
