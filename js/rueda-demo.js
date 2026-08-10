// Instancia las dos ruedas semicirculares (camperas arriba, accesorios
// abajo) con círculos rojos de prueba — todavía no hay fotos reales de
// ninguna de las dos categorías. Reemplazar `color` por `imagen_url` acá
// cuando el usuario cargue accesorios/camperas de verdad; el widget
// (js/rueda.js) ya soporta ambos casos sin cambios.
//
// La rueda de ARRIBA es camperas, con exactamente 3 opciones — el usuario
// va a cargar 3 fotos reales de campera pronto (avisado 9-ago-2026) y hay
// que reemplazar este array por esas 3, sin agregar ni sacar lugares.

document.addEventListener("ropero:listo", () => {
  crearRuedaSemicircular({
    id: "camperas",
    top: "26vh",
    opciones: [
      { nombre: "Campera de prueba 1", color: "#e11d2e" },
      { nombre: "Campera de prueba 2", color: "#e11d2e" },
      { nombre: "Campera de prueba 3", color: "#e11d2e" },
    ],
  });

  crearRuedaSemicircular({
    id: "accesorios",
    top: "58vh",
    opciones: [
      { nombre: "Accesorio de prueba 1", color: "#e11d2e" },
      { nombre: "Accesorio de prueba 2", color: "#e11d2e" },
      { nombre: "Accesorio de prueba 3", color: "#e11d2e" },
      { nombre: "Accesorio de prueba 4", color: "#e11d2e" },
      { nombre: "Accesorio de prueba 5", color: "#e11d2e" },
    ],
  });
});
