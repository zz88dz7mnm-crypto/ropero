// Instancia las dos ruedas semicirculares (accesorios arriba, camperas/abrigo
// abajo) con círculos rojos de prueba — todavía no hay fotos reales de
// ninguna de las dos categorías. Reemplazar `color` por `imagen_url` acá
// cuando el usuario cargue accesorios/camperas de verdad; el widget
// (js/rueda.js) ya soporta ambos casos sin cambios.

document.addEventListener("ropero:listo", () => {
  crearRuedaSemicircular({
    id: "accesorios",
    top: "26vh",
    opciones: [
      { nombre: "Accesorio de prueba 1", color: "#e11d2e" },
      { nombre: "Accesorio de prueba 2", color: "#e11d2e" },
      { nombre: "Accesorio de prueba 3", color: "#e11d2e" },
      { nombre: "Accesorio de prueba 4", color: "#e11d2e" },
      { nombre: "Accesorio de prueba 5", color: "#e11d2e" },
    ],
  });

  crearRuedaSemicircular({
    id: "camperas",
    top: "58vh",
    opciones: [
      { nombre: "Campera de prueba 1", color: "#e11d2e" },
      { nombre: "Campera de prueba 2", color: "#e11d2e" },
      { nombre: "Campera de prueba 3", color: "#e11d2e" },
      { nombre: "Campera de prueba 4", color: "#e11d2e" },
    ],
  });
});
