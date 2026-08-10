// Instancia las dos ruedas semicirculares: camperas (arriba) y accesorios
// (abajo), ambas con fotos reales del usuario.

// Altura calibrada por foto (canal alpha + ancho, mismo método que gorras y
// zapatillas — ver [[ropero-criterios-diseno]] en memoria) para que las 4
// camperas se vean del mismo porte real entre sí. Dos tamaños por foto:
// - alturaDesktopVh/alturaMobileVh: el flotante "posado" sobre el outfit
//   (+15% a pedido del usuario, 9-ago-2026, sobre el cálculo original).
// - dotAlturaPx: la vista chica dentro de la rueda misma — también sin
//   recorte circular (a pedido del usuario, "esa es la gracia"), pero más
//   chica que el flotante porque conviven varias en el arco a la vez.
//   Ronda 10-ago-2026 (probado en el celular real, no solo en preview):
//   primero se probó radio 100/dot ~39-43 ("la rueda esta MUUUY grande"),
//   pero en el uso real el usuario pidió lo contrario en un eje y lo mismo
//   en el otro: "la rueda es muy ancha, mas cerca del eje" (radio más chico
//   todavía) PERO "mas grande las camperitas" (dot más grande). No son el
//   mismo pedido — radio controla cuánto se estira el arco hacia la
//   pantalla, dotPx controla el tamaño de cada foto — así que se pueden
//   mover en direcciones opuestas. Eso sí, con solo 4 camperas el ángulo
//   entre opciones (pasoGrados) no puede pasar de 32° sin que la 3ra/4ta
//   choquen contra el tope de ±96° del arco (offset máximo realista = 3,
//   3*32=96 exacto) — por eso subió de 27 a 32 al mismo tiempo, para
//   compensar apenas el radio más chico. Con radio chico + puntos grandes
//   los de atrás quedan un poco tapados por el de adelante — es intencional
//   acá (efecto "mazo de cartas abanicado", con z-index + drop-shadow ya
//   puestos para leerse como profundidad), no es el mismo criterio de "cero
//   superposición" de las filas principales del outfit.
const ALTURA_CAMPERAS_VH = {
  "img/camperas/corderoy-redtap-marron.png": { desktop: 17.572, mobile: 20.907, dotPx: 62 },
  "img/camperas/bomber-verde.png": { desktop: 17.377, mobile: 20.677, dotPx: 62 },
  "img/camperas/puffer-negra.png": { desktop: 18.964, mobile: 22.563, dotPx: 67 },
  "img/camperas/puffer-negra-capucha.png": { desktop: 16.871, mobile: 20.079, dotPx: 60 },
};

// Radio más chico específicamente para camperas (el default de 150, en
// RUEDA_RADIO de rueda.js, lo sigue usando accesorios sin cambios).
const RADIO_CAMPERAS = 75;
const PASO_GRADOS_CAMPERAS = 32;

// Con 7 accesorios (vs. hasta 4 camperas) el pasoGrados default (27°, ver
// RUEDA_PASO_GRADOS en rueda.js) hace que del 5to accesorio en adelante
// choquen todos contra el mismo tope de ±96° (0-indexado arrancando en la
// 1ra opción: offset 4*27=108 ya se clampea a 96, igual que el 5to y 6to)
// y queden apilados exactamente en el mismo lugar. 15° dejá los 7
// (offsets 0 a 6) repartidos sin pisarse entre sí (6*15=90, adentro del
// límite de 96).
const PASO_GRADOS_ACCESORIOS = 15;

// Accesorios reales (10-ago-2026): a diferencia de camperas/gorras/
// zapatillas, no salen de Supabase (no hay tabla `accesorios` todavía) —
// son fotos sueltas del usuario, así que van hardcodeadas acá mismo, cada
// una con su nombre e imagen. Mismo método de calibración por altura (canal
// alpha + ancho) que el resto del proyecto, pero sin el criterio de "mismo
// porte real entre sí" que usan camperas (son 4 tipos de objeto bien
// distintos — reloj, pulsera, collar, anillo — así que el tamaño de cada
// uno sale de cuánto ocupa esa prenda puesta en la vida real, no de
// igualar todas entre sí): relojes y collares (que la foto encuadra con
// la correa/cordón estirado de punta a punta) quedan como las piezas más
// grandes de la rueda; pulseras y anillo, más chicas.
const ACCESORIOS = [
  {
    nombre: "Reloj Casio digital plateado",
    imagen_url: "img/accesorios/casio-digital-plateado.png",
    alturaDesktopVh: 19.5,
    alturaMobileVh: 23.2,
    dotAlturaPx: 62,
  },
  {
    nombre: "Reloj Casio analógico plateado",
    imagen_url: "img/accesorios/casio-analogico-plateado.png",
    alturaDesktopVh: 19.5,
    alturaMobileVh: 23.2,
    dotAlturaPx: 62,
  },
  {
    nombre: "Collar tabla de surf hueso con yin yang",
    imagen_url: "img/accesorios/collar-tabla-surf-hueso-yinyang.png",
    alturaDesktopVh: 21.5,
    alturaMobileVh: 25.6,
    dotAlturaPx: 64,
  },
  {
    nombre: "Collar tabla de surf plata envejecida",
    imagen_url: "img/accesorios/collar-tabla-surf-plata-vieja.png",
    alturaDesktopVh: 21.5,
    alturaMobileVh: 25.6,
    dotAlturaPx: 64,
  },
  {
    nombre: "Pulsera de cuero trenzada negra y marrón",
    imagen_url: "img/accesorios/pulsera-cuero-trenzada-negro-marron.png",
    alturaDesktopVh: 10.5,
    alturaMobileVh: 12.5,
    dotAlturaPx: 42,
  },
  {
    nombre: "Pulsera metálica elastizada plateada",
    imagen_url: "img/accesorios/pulsera-metalica-elastizada-plateada.png",
    alturaDesktopVh: 9,
    alturaMobileVh: 10.7,
    dotAlturaPx: 40,
  },
  {
    nombre: "Anillo plateado con picos negros",
    imagen_url: "img/accesorios/anillo-plateado-picos-negros.png",
    alturaDesktopVh: 7.5,
    alturaMobileVh: 9,
    dotAlturaPx: 34,
  },
];

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
    radio: RADIO_CAMPERAS,
    pasoGrados: PASO_GRADOS_CAMPERAS,
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
    pasoGrados: PASO_GRADOS_ACCESORIOS,
    opciones: ACCESORIOS,
  });
});
