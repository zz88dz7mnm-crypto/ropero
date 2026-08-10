// Instancia las dos ruedas semicirculares: camperas (arriba) con las 4 fotos
// reales del usuario, accesorios (abajo) todavía con círculos rojos de
// prueba — no hay fotos reales de accesorios todavía. Reemplazar `color`
// por `imagen_url` (+ altura calibrada si aplica) ahí cuando lleguen.

// Altura calibrada por foto (canal alpha + ancho, mismo método que gorras y
// zapatillas — ver [[ropero-criterios-diseno]] en memoria) para que las 4
// camperas se vean del mismo porte real entre sí. Dos tamaños por foto:
// - alturaDesktopVh/alturaMobileVh: el flotante "posado" sobre el outfit
//   (+15% a pedido del usuario, 9-ago-2026, sobre el cálculo original).
// - dotAlturaPx: la vista chica dentro de la rueda misma — también sin
//   recorte circular (a pedido del usuario, "esa es la gracia"), pero más
//   chica que el flotante porque conviven varias en el arco a la vez.
const ALTURA_CAMPERAS_VH = {
  "img/camperas/corderoy-redtap-marron.png": { desktop: 17.572, mobile: 20.907, dotPx: 59 },
  "img/camperas/bomber-verde.png": { desktop: 17.377, mobile: 20.677, dotPx: 59 },
  "img/camperas/puffer-negra.png": { desktop: 18.964, mobile: 22.563, dotPx: 64 },
  "img/camperas/puffer-negra-capucha.png": { desktop: 16.871, mobile: 20.079, dotPx: 57 },
};

document.addEventListener("ropero:listo", () => {
  const camperas = (window.Ropero.datos.camperas || []).map((c) => {
    const t = ALTURA_CAMPERAS_VH[c.imagen_url] || { desktop: 18, mobile: 21, dotPx: 60 };
    return {
      nombre: c.nombre,
      imagen_url: c.imagen_url,
      alturaDesktopVh: t.desktop,
      alturaMobileVh: t.mobile,
      dotAlturaPx: t.dotPx,
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
