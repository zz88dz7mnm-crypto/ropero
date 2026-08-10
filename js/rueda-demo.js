// Instancia las dos ruedas semicirculares: camperas (arriba) con las 4 fotos
// reales del usuario, accesorios (abajo) todavía con círculos rojos de
// prueba — no hay fotos reales de accesorios todavía. Reemplazar `color`
// por `imagen_url` (+ altura calibrada si aplica) ahí cuando lleguen.

// Altura calibrada por foto (canal alpha + ancho, mismo método que gorras y
// zapatillas — ver [[ropero-criterios-diseno]] en memoria) para que las 4
// camperas se vean del mismo porte real entre sí cuando posan sobre el
// outfit. No hay "referencia vieja" para las camperas (son las primeras que
// se cargan), así que el target de ancho se definió de cero mirando cómo
// quedaba en pantalla.
const ALTURA_CAMPERAS_VH = {
  "img/camperas/corderoy-redtap-marron.png": { desktop: 15.28, mobile: 18.18 },
  "img/camperas/bomber-verde.png": { desktop: 15.11, mobile: 17.98 },
  "img/camperas/puffer-negra.png": { desktop: 16.49, mobile: 19.62 },
  "img/camperas/puffer-negra-capucha.png": { desktop: 14.67, mobile: 17.46 },
};

document.addEventListener("ropero:listo", () => {
  const camperas = (window.Ropero.datos.camperas || []).map((c) => {
    const altura = ALTURA_CAMPERAS_VH[c.imagen_url] || { desktop: 16, mobile: 19 };
    return {
      nombre: c.nombre,
      imagen_url: c.imagen_url,
      alturaDesktopVh: altura.desktop,
      alturaMobileVh: altura.mobile,
    };
  });

  crearRuedaSemicircular({
    id: "camperas",
    top: "26vh",
    opciones: camperas.length
      ? camperas
      : [
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
