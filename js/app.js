// Cuatro coverflows independientes (gorra / remera / pantalón / zapatilla)
// que comparten el mismo eje central para poder armar combinaciones. Las
// imágenes se usan tal cual las carga cada prenda (sin recortar ni editar);
// el tamaño de cada fila se controla solo por CSS (ver style.css). Solo
// lectura: la carga de prendas y sus tags se hace aparte, directo en la base.

const ESPACIADO = 165; // px entre el centro de una prenda y la siguiente
const SENSIBILIDAD_RUEDA = 1; // qué tan rápido responde el trackpad

// No editamos ninguna imagen (van tal cual las carga cada prenda), pero cada
// foto trae distinto margen/encuadre alrededor del objeto, así que a igual
// "height" de CSS se ven de tamaño distinto. Estos valores fijan la altura
// de cada imagen puntual para que el ANCHO real (lo que se lee como tamaño)
// quede parejo entre gorras y entre zapatillas. Es solo tamaño de
// visualización, no toca el archivo.
const ALTURA_VH_DESKTOP = {
  "img/gorras/billabong-marron.png": 8.2258,
  "img/gorras/newera-verde-5panel.png": 7.8948,
  "img/gorras/newera-crudo-script.png": 8.8867,
  "img/gorras/yankees-beige-piedepollo.png": 8.6429,
  "img/gorras/powell-peralta-negra.png": 10.3856,
  "img/gorras/yankees-roja-snapback.png": 7.8235,
  "img/gorras/padres-marron-fitted.png": 7.9188,
  "img/gorras/dodgers-negra.png": 7.9673,
  "img/zapatillas/vans-halfcab-negra.png": 8.8083,
  "img/zapatillas/havaianas-terracota.png": 8.6311,
  "img/zapatillas/vans-skhi-negra.png": 8.8203,
  "img/zapatillas/havaianas-amarillas.png": 8.8203,
  "img/zapatillas/timberland-miel.png": 8.7603,
  "img/zapatillas/adidas-ultraboost-negra.png": 8.6023,
  "img/zapatillas/birkenstock-boston-marron.png": 8.7782,
  "img/zapatillas/adidas-gazelle-gris.png": 12.6973,
  "img/pantalones/largo-abrigado-negro-tecnico.png": 22.1747,
  "img/pantalones/jean-normal-celeste-carpenter.png": 21.9794,
  "img/pantalones/jean-normal-gris-claro.png": 20.6055,
  "img/pantalones/jean-normal-topo.png": 23.2295,
  "img/pantalones/jean-normal-marron.png": 36.2306,
  "img/pantalones/largo-deportivo-negro-tab-rojo.png": 23.5214,
  "img/pantalones/largo-deportivo-adidas-negro.png": 22.5986,
  "img/pantalones/largo-deportivo-clinch-gris.png": 23.2295,
  "img/pantalones/short-casual-billabong-negro.png": 21.9794,
  "img/pantalones/short-casual-tropical-verde.png": 22.0875,
  "img/pantalones/short-casual-abercrombie-negro.png": 14.7419,
  "img/pantalones/short-normal-beige-carpenter.png": 21.9794,
  "img/pantalones/short-normal-denim-celeste.png": 21.9794,
  "img/pantalones/short-normal-camuflado.png": 21.9794,
  "img/pantalones/short-normal-denim-gris.png": 22.1092,
  "img/pantalones/corto-deportivo-allblacks-negro.png": 10.8203,
  "img/pantalones/corto-deportivo-negro-liso.png": 10.1116,
  "img/pantalones/malla-billabong-negra.png": 14.6477,
  "img/pantalones/malla-billabong-bicolor.png": 11.1258,
  "img/pantalones/corderoy-recto-marron.png": 23.5461,
  "img/pantalones/corderoy-recto-verde.png": 22.5532,
  "img/pantalones/formal-lacoste-beige-1.png": 22.2406,
  "img/pantalones/formal-lacoste-beige-2.png": 24.1537,
  "img/remeras/camisa-zara-rayas-gris.png": 16.0248,
  "img/remeras/camisa-bershka-beige-lakedinnerclub.png": 16.0747,
  "img/remeras/remera-rayas-azul-blanco.png": 16.1501,
  "img/remeras/polo-bershka-negra-sol.png": 15.8892,
  "img/remeras/remera-gris-oscuro-lisa.png": 15.2105,
  "img/remeras/remera-john-lennon-blanca.png": 16.3288,
  "img/remeras/polo-england-rugby-azul.png": 16.7119,
  "img/remeras/polo-cuello-alto-crudo.png": 19.1436,
  "img/remeras/remera-lecoqsportif-roja.png": 16.6044,
  "img/remeras/remera-nike-rc-celeste.png": 15.7438,
  "img/remeras/remera-rc-marron.png": 15.3120,
  "img/remeras/remera-beatles-verde-militar.png": 15.9259,
  "img/remeras/remera-volcom-blanca.png": 16.4197,
  "img/remeras/remera-azul-marino-lisa.png": 20.5154,
  "img/remeras/remera-lions-jaguar-negra.png": 16.3547,
  "img/remeras/remera-modena-retrato-negra.png": 16.4852,
  "img/remeras/remera-bastard-cerezas-negra.png": 16.5115,
  "img/remeras/polo-blk-cordoba-rugby-blanca.png": 17.5050,
  "img/remeras/ml-captainfin-verde.png": 16.8758,
  "img/remeras/ml-ireland-rugby-verde.png": 16.3676,
  "img/remeras/ml-zumith-blanca.png": 16.0747,
  "img/remeras/ml-cuello-boton-gris.png": 15.7319,
  "img/remeras/ml-southafrica-rugby-verde.png": 14.2948,
  "img/remeras/ml-blockbyblock-blanco-negro.png": 20.4656,
  "img/remeras/remera-ripcurl-rayas-negra.png": 17.0993,
  "img/remeras/polo-union-blanca-clunce.png": 17.6396,
  "img/remeras/polo-union-negra-clunce.png": 20.5154,
  "img/remeras/remera-nike-tropical-blanca.png": 17.0851,
  "img/remeras/remera-ripcurl-verde-lisa.png": 16.7934,
  "img/remeras/remera-baw-bloques-verde.png": 16.4720,
  "img/remeras/remera-dc-negra.png": 30.2577,
  // camisa-billabong-verde: la foto es vertical (a diferencia de casi todas
  // las remeras, que son horizontales) — calibrada "a full" por ancho le
  // tocaban 30.4vh, altura que choca contra la gorra de arriba y el
  // pantalón de abajo (fila de remeras es angosta). Se topea en 28.5vh, el
  // máximo que deja >=0.3vh de margen real contra ambas filas vecinas en
  // las 8 gorras x 23 pantalones combinaciones — se ve un pelo más angosta
  // que el resto (ancho real ~6% menor), mejor eso que superposición.
  "img/remeras/camisa-billabong-verde.png": 28.5,
  "img/remeras/camiseta-argentina-celeste.png": 20.7340,
  "img/remeras/camiseta-universitario-roja-1.png": 20.4325,
  "img/remeras/camiseta-universitario-roja-2.png": 17.5050,
  // ml-adidas-oasis-blanco-negro: la foto original no traía canal alpha
  // (fondo blanco liso, no transparente). Se le generó transparencia real
  // por flood-fill desde las 4 esquinas (tolerancia de color chica, para
  // no comerse el cuerpo blanco de la remera — las mangas negras dan buen
  // contraste con el fondo en casi todo el contorno) y recién ahí se
  // calibró igual que el resto. No es un recorte manual de la prenda, solo
  // se le agregó la transparencia que le faltaba al archivo original.
  "img/remeras/ml-adidas-oasis-blanco-negro.png": 16.1196,
  // Buzos (tipo="buzo", comparten fila/eje con remeras): calibrados con el
  // MISMO target de ancho que las remeras (misma "familia de escala" en el
  // mismo slot), no un target propio. 10 de los 37 quedaron topeados a mano
  // (altura real algo menor a la que pedía la fórmula) porque sus fotos
  // están encuadradas mucho más "a full frame" que el resto — a ese target
  // esa altura invadía gorra o pantalón. Ver [[ropero-criterios-diseno]].
  "img/buzos/buzo-sunforce-rayas-verde.png": 25.3413,
  "img/buzos/buzo-punto-verde-liso.png": 25.4096,
  "img/buzos/buzo-bolivia-azul.png": 25.2733,
  "img/buzos/buzo-punto-grafico-azul.png": 15.5919,
  "img/buzos/buzo-vans-beige.png": 17.0479,
  "img/buzos/buzo-cuartozip-rojo.png": 16.0841,
  "img/buzos/buzo-cuartozip-gris.png": 15.6248,
  "img/buzos/buzo-gris-liso.png": 17.0082,
  "img/buzos/buzo-nike-verde-textura.png": 15.9902,
  "img/buzos/buzo-vans-azul.png": 15.33,
  "img/buzos/camisa-zip-foundedbysole-marron.png": 26.9205,
  "img/buzos/camisa-flanela-mostaza.png": 27.0452,
  "img/buzos/camisa-flanela-ripcurl-beige.png": 26.5351,
  "img/buzos/buzo-santacruz-tiedye-azul.png": 24.4761,
  "img/buzos/buzo-punto-ripcurl-gris.png": 26.9702,
  "img/buzos/buzo-lacoste-azul.png": 27.0953,
  "img/buzos/buzo-punto-ripcurl-verde.png": 27.0201,
  "img/buzos/buzo-punto-quince-azul.png": 27.247,
  "img/buzos/buzo-punto-lacoste-bordo.png": 27.2724,
  "img/buzos/buzo-quince-gris-rojo.png": 24.6566,
  "img/buzos/camisa-urbano-gris.png": 27.0201,
  "img/buzos/campera-lions-roja.png": 22.649,
  "img/buzos/campera-adidasoasis-azul.png": 21.1422,
  "img/buzos/buzo-negro-grafico.png": 19.9381,
  "img/buzos/campera-lacoste-verde.png": 21.0795,
  "img/buzos/campera-quince-azul-roja.png": 26.7065,
  "img/buzos/campera-adidas-independiente-blanca.png": 17.8376,
  "img/buzos/buzo-chill-negro.png": 31.2597,
  "img/buzos/campera-evermount-negra.png": 27.3237,
  "img/buzos/campera-bomber-gris.png": 30.3169,
  "img/buzos/buzo-capucha-cuadros-azul.png": 28.8343,
  "img/buzos/campera-oj-roja.png": 21.8581,
  "img/buzos/campera-oj-negra.png": 23.7074,
  "img/buzos/buzo-cardigan-lacoste-azul.png": 26.5864,
  "img/buzos/campera-acmilan-roja.png": 28.5098,
  "img/buzos/buzo-capucha-gris.png": 26.3493,
  "img/buzos/campera-jean-levis-azul.png": 20.4987,
};

const ALTURA_VH_MOBILE = {
  "img/gorras/billabong-marron.png": 9.7854,
  "img/gorras/newera-verde-5panel.png": 9.3916,
  "img/gorras/newera-crudo-script.png": 10.5715,
  "img/gorras/yankees-beige-piedepollo.png": 10.2815,
  "img/gorras/powell-peralta-negra.png": 12.3547,
  "img/gorras/yankees-roja-snapback.png": 9.3068,
  "img/gorras/padres-marron-fitted.png": 9.4202,
  "img/gorras/dodgers-negra.png": 9.4779,
  "img/zapatillas/vans-halfcab-negra.png": 10.4802,
  "img/zapatillas/havaianas-terracota.png": 10.2695,
  "img/zapatillas/vans-skhi-negra.png": 10.4945,
  "img/zapatillas/havaianas-amarillas.png": 10.4945,
  "img/zapatillas/timberland-miel.png": 10.4232,
  "img/zapatillas/adidas-ultraboost-negra.png": 10.2352,
  "img/zapatillas/birkenstock-boston-marron.png": 10.4445,
  "img/zapatillas/adidas-gazelle-gris.png": 15.1075,
  "img/pantalones/largo-abrigado-negro-tecnico.png": 26.4056,
  "img/pantalones/jean-normal-celeste-carpenter.png": 26.1730,
  "img/pantalones/jean-normal-gris-claro.png": 24.5370,
  "img/pantalones/jean-normal-topo.png": 27.6617,
  "img/pantalones/jean-normal-marron.png": 43.1433,
  "img/pantalones/largo-deportivo-negro-tab-rojo.png": 28.0093,
  "img/pantalones/largo-deportivo-adidas-negro.png": 26.9103,
  "img/pantalones/largo-deportivo-clinch-gris.png": 27.6617,
  "img/pantalones/short-casual-billabong-negro.png": 26.1730,
  "img/pantalones/short-casual-tropical-verde.png": 26.3017,
  "img/pantalones/short-casual-abercrombie-negro.png": 17.5546,
  "img/pantalones/short-normal-beige-carpenter.png": 26.1730,
  "img/pantalones/short-normal-denim-celeste.png": 26.1730,
  "img/pantalones/short-normal-camuflado.png": 26.1730,
  "img/pantalones/short-normal-denim-gris.png": 26.3276,
  "img/pantalones/corto-deportivo-allblacks-negro.png": 12.8848,
  "img/pantalones/corto-deportivo-negro-liso.png": 12.0409,
  "img/pantalones/malla-billabong-negra.png": 17.4424,
  "img/pantalones/malla-billabong-bicolor.png": 13.2486,
  "img/pantalones/corderoy-recto-marron.png": 28.0386,
  "img/pantalones/corderoy-recto-verde.png": 26.8563,
  "img/pantalones/formal-lacoste-beige-1.png": 26.4840,
  "img/pantalones/formal-lacoste-beige-2.png": 28.7622,
  "img/remeras/camisa-zara-rayas-gris.png": 19.0631,
  "img/remeras/camisa-bershka-beige-lakedinnerclub.png": 19.1224,
  "img/remeras/remera-rayas-azul-blanco.png": 19.2121,
  "img/remeras/polo-bershka-negra-sol.png": 18.9018,
  "img/remeras/remera-gris-oscuro-lisa.png": 18.0945,
  "img/remeras/remera-john-lennon-blanca.png": 19.4247,
  "img/remeras/polo-england-rugby-azul.png": 19.8805,
  "img/remeras/polo-cuello-alto-crudo.png": 22.7732,
  "img/remeras/remera-lecoqsportif-roja.png": 19.7526,
  "img/remeras/remera-nike-rc-celeste.png": 18.7289,
  "img/remeras/remera-rc-marron.png": 18.2152,
  "img/remeras/remera-beatles-verde-militar.png": 18.9455,
  "img/remeras/remera-volcom-blanca.png": 19.5328,
  "img/remeras/remera-azul-marino-lisa.png": 24.4051,
  "img/remeras/remera-lions-jaguar-negra.png": 19.4555,
  "img/remeras/remera-modena-retrato-negra.png": 19.6108,
  "img/remeras/remera-bastard-cerezas-negra.png": 19.6421,
  "img/remeras/polo-blk-cordoba-rugby-blanca.png": 20.8240,
  "img/remeras/ml-captainfin-verde.png": 20.0754,
  "img/remeras/ml-ireland-rugby-verde.png": 19.4709,
  "img/remeras/ml-zumith-blanca.png": 19.1224,
  "img/remeras/ml-cuello-boton-gris.png": 18.7146,
  "img/remeras/ml-southafrica-rugby-verde.png": 17.0050,
  "img/remeras/ml-blockbyblock-blanco-negro.png": 24.3458,
  "img/remeras/remera-ripcurl-rayas-negra.png": 20.3413,
  "img/remeras/polo-union-blanca-clunce.png": 20.9840,
  "img/remeras/polo-union-negra-clunce.png": 24.4051,
  "img/remeras/remera-nike-tropical-blanca.png": 20.3245,
  "img/remeras/remera-ripcurl-verde-lisa.png": 19.9775,
  "img/remeras/remera-baw-bloques-verde.png": 19.5951,
  "img/remeras/remera-dc-negra.png": 35.9946,
  "img/remeras/camisa-billabong-verde.png": 33.9,
  "img/remeras/camiseta-argentina-celeste.png": 24.6652,
  "img/remeras/camiseta-universitario-roja-1.png": 24.3065,
  "img/remeras/camiseta-universitario-roja-2.png": 20.8240,
  "img/remeras/ml-adidas-oasis-blanco-negro.png": 19.1759,
  "img/buzos/buzo-sunforce-rayas-verde.png": 30.146,
  "img/buzos/buzo-punto-verde-liso.png": 30.2273,
  "img/buzos/buzo-bolivia-azul.png": 30.0652,
  "img/buzos/buzo-punto-grafico-azul.png": 18.5481,
  "img/buzos/buzo-vans-beige.png": 20.2802,
  "img/buzos/buzo-cuartozip-rojo.png": 19.1337,
  "img/buzos/buzo-cuartozip-gris.png": 18.5872,
  "img/buzos/buzo-gris-liso.png": 20.233,
  "img/buzos/buzo-nike-verde-textura.png": 19.022,
  "img/buzos/buzo-vans-azul.png": 18.2366,
  "img/buzos/camisa-zip-foundedbysole-marron.png": 32.0247,
  "img/buzos/camisa-flanela-mostaza.png": 32.173,
  "img/buzos/camisa-flanela-ripcurl-beige.png": 31.3337,
  "img/buzos/buzo-santacruz-tiedye-azul.png": 28.9023,
  "img/buzos/buzo-punto-ripcurl-gris.png": 32.0838,
  "img/buzos/buzo-lacoste-azul.png": 32.2326,
  "img/buzos/buzo-punto-ripcurl-verde.png": 32.1432,
  "img/buzos/buzo-punto-quince-azul.png": 32.413,
  "img/buzos/buzo-punto-lacoste-bordo.png": 32.4433,
  "img/buzos/buzo-quince-gris-rojo.png": 29.1154,
  "img/buzos/camisa-urbano-gris.png": 32.1432,
  "img/buzos/campera-lions-roja.png": 26.9433,
  "img/buzos/campera-adidasoasis-azul.png": 25.1508,
  "img/buzos/buzo-negro-grafico.png": 23.7184,
  "img/buzos/campera-lacoste-verde.png": 25.0762,
  "img/buzos/campera-quince-azul-roja.png": 31.536,
  "img/buzos/campera-adidas-independiente-blanca.png": 21.2196,
  "img/buzos/buzo-chill-negro.png": 37.0093,
  "img/buzos/campera-evermount-negra.png": 32.2649,
  "img/buzos/campera-bomber-gris.png": 36.065,
  "img/buzos/buzo-capucha-cuadros-azul.png": 34.0487,
  "img/buzos/campera-oj-roja.png": 26.0024,
  "img/buzos/campera-oj-negra.png": 27.9946,
  "img/buzos/buzo-cardigan-lacoste-azul.png": 31.3942,
  "img/buzos/campera-acmilan-roja.png": 33.6655,
  "img/buzos/buzo-capucha-gris.png": 31.1143,
  "img/buzos/campera-jean-levis-azul.png": 24.3853,
};

// Registro global chico: js/generar.js lo usa para leer las prendas
// cargadas y para animar cada fila hasta la prenda elegida (irA). No cambia
// nada de cómo funciona el coverflow en sí.
window.Ropero = { datos: {}, coverflows: {} };

document.addEventListener("DOMContentLoaded", init);

async function init() {
  if (!supabaseConfigurado()) {
    mostrarVacio("fila-gorras", "Supabase no está configurado. Revisá js/config.js.");
    mostrarVacio("fila-remeras", "Supabase no está configurado. Revisá js/config.js.");
    mostrarVacio("fila-pantalones", "Supabase no está configurado. Revisá js/config.js.");
    mostrarVacio("fila-zapatillas", "Supabase no está configurado. Revisá js/config.js.");
    return;
  }

  const [gorras, remerasYBuzos, pantalones, zapatillas] = await Promise.all([
    listarGorras(),
    listarRemeras(),
    listarPantalones(),
    listarZapatillas(),
  ]);

  // La gorra es opcional: sumamos un slot "sin gorro" (sin imagen) como
  // primera opción del carrusel, para poder armar el outfit sin gorra.
  const gorrasConVacio = [{ id: "sin-gorro", nombre: "Sin gorro", imagen_url: null }, ...gorras];

  // Tren superior: remeras y buzos comparten el mismo eje/fila (una sola
  // pasada al deslizar), pero agrupados — primero pasan todas las remeras y
  // recién después todos los buzos, nunca mezclados. Las camperas NO entran
  // acá: van a ser su propio widget aparte (rueda de accesorios/abrigo).
  // Dentro de cada grupo se respeta el orden que ya traía la consulta
  // (creado_en desc), porque filter() no reordena.
  const remeras = agruparPorTipo(remerasYBuzos, ["remera", "buzo"]);

  // Camperas: viven en la misma tabla (tipo="campera") pero no entran al
  // eje de tren superior — las consume js/rueda-demo.js para la rueda
  // semicircular. Se mantiene el orden de creado_en (ajustado a mano para
  // que salgan de la más usada a la menos usada, ver dataStore.js).
  const camperas = remerasYBuzos.filter((r) => r.tipo === "campera");

  window.Ropero.datos = { gorras: gorrasConVacio, remeras, pantalones, zapatillas, camperas };

  montarFila("gorras", "fila-gorras", "stage-gorras", "track-gorras", gorrasConVacio, "Todavía no hay gorras cargadas.");
  montarFila("remeras", "fila-remeras", "stage-remeras", "track-remeras", remeras, "Todavía no hay remeras cargadas.");
  montarFila("pantalones", "fila-pantalones", "stage-pantalones", "track-pantalones", pantalones, "Todavía no hay pantalones cargados.");
  montarFila("zapatillas", "fila-zapatillas", "stage-zapatillas", "track-zapatillas", zapatillas, "Todavía no hay zapatillas cargadas.");

  document.dispatchEvent(new CustomEvent("ropero:listo"));
}

// Agrupa items por `tipo` respetando el orden de la lista `orden` (ej.
// ["remera","buzo"] => primero todas las remeras, después todos los buzos).
// Los items con un tipo que no está en `orden` quedan afuera (así se excluye
// "campera" del eje de tren superior sin tener que tocar la consulta SQL).
function agruparPorTipo(items, orden) {
  return orden.flatMap((tipo) => items.filter((it) => (it.tipo || "remera") === tipo));
}

function montarFila(categoria, filaId, stageId, trackId, items, mensajeVacio) {
  if (!items.length) {
    mostrarVacio(filaId, mensajeVacio);
    return;
  }
  const trackEl = document.getElementById(trackId);
  const stageEl = document.getElementById(stageId);
  const cf = crearCoverflow(trackEl, items, categoria);
  cf.construir();
  cf.render(true);
  habilitarGestos(stageEl, cf);
  window.Ropero.coverflows[categoria] = cf;
}

function mostrarVacio(filaId, mensaje) {
  const fila = document.getElementById(filaId);
  if (!fila) return;
  const div = document.createElement("div");
  div.className = "vacio-fila";
  div.textContent = mensaje;
  fila.appendChild(div);
}

function crearCoverflow(trackEl, items, categoria) {
  const estado = { items, indiceActual: 0, arrastrando: false };

  function construir() {
    trackEl.innerHTML = "";
    items.forEach((item, i) => {
      const card = document.createElement("div");
      const esVacio = !item.imagen_url;
      card.className = esVacio ? "card vacio-gorra" : "card";
      card.dataset.index = i;
      if (!esVacio) {
        card.innerHTML = `<img src="${item.imagen_url}" alt="${item.nombre || ""}" draggable="false" />`;
        const tabla = window.matchMedia("(max-width: 600px)").matches ? ALTURA_VH_MOBILE : ALTURA_VH_DESKTOP;
        const alto = tabla[item.imagen_url];
        if (alto) card.querySelector("img").style.height = alto + "vh";
      }
      card.addEventListener("click", () => {
        if (estado.arrastrando) return;
        irA(i);
      });
      trackEl.appendChild(card);
    });
  }

  function render(inicial = false) {
    trackEl.querySelectorAll(".card").forEach((card) => {
      const i = Number(card.dataset.index);
      const offset = i - estado.indiceActual;
      const dist = Math.min(Math.abs(offset), 4);

      const traslX = offset * ESPACIADO;
      const rotY = Math.max(-45, Math.min(45, offset * -40));
      const escala = Math.max(0.55, 1 - dist * 0.16);
      const opacidad = Math.max(0, 1 - dist * 0.32);
      const brillo = Math.max(0.3, 1 - dist * 0.22);
      const z = Math.round(100 - dist * 10);

      card.style.transform = `translate(-50%, -50%) translateX(${traslX}px) translateZ(${-dist * 90}px) rotateY(${rotY}deg) scale(${escala})`;
      card.style.opacity = opacidad;
      card.style.filter = `brightness(${brillo})`;
      card.style.zIndex = z;
      card.style.pointerEvents = dist > 3.2 ? "none" : "auto";

      if (inicial) card.classList.remove("en-movimiento");
    });
  }

  function irA(indice) {
    estado.indiceActual = Math.max(0, Math.min(items.length - 1, indice));
    trackEl.querySelectorAll(".card").forEach((c) => c.classList.remove("en-movimiento"));
    render();
    // Avisa que esta fila terminó de asentarse en una prenda (click, drag,
    // rueda, o animación de Generar/Favoritos/Random) — js/favoritos.js lo
    // escucha para saber si el outfit armado ahora mismo ya es favorito.
    document.dispatchEvent(new CustomEvent("ropero:fila-asentada", { detail: { categoria } }));
  }

  return { estado, construir, render, irA };
}

function habilitarGestos(stageEl, cf) {
  let inicioX = 0;
  let indiceBase = 0;

  const marcarMoviendo = (activo) => {
    stageEl.querySelectorAll(".card").forEach((c) => c.classList.toggle("en-movimiento", activo));
  };

  stageEl.addEventListener("pointerdown", (ev) => {
    cf.estado.arrastrando = true;
    inicioX = ev.clientX;
    indiceBase = cf.estado.indiceActual;
    stageEl.setPointerCapture(ev.pointerId);
    marcarMoviendo(true);
  });

  stageEl.addEventListener("pointermove", (ev) => {
    if (!cf.estado.arrastrando) return;
    const deltaX = ev.clientX - inicioX;
    let nuevo = indiceBase - deltaX / ESPACIADO;
    nuevo = Math.max(-0.6, Math.min(cf.estado.items.length - 1 + 0.6, nuevo));
    cf.estado.indiceActual = nuevo;
    cf.render();
  });

  const soltar = () => {
    if (!cf.estado.arrastrando) return;
    cf.estado.arrastrando = false;
    marcarMoviendo(false);
    cf.irA(Math.round(cf.estado.indiceActual));
  };
  stageEl.addEventListener("pointerup", soltar);
  stageEl.addEventListener("pointercancel", soltar);

  // Trackpad: gesto de dos dedos (deltaX de "wheel"). Se ignora si hay
  // ctrlKey (eso es pinch-to-zoom) para no interferir con el zoom del navegador.
  let temporizadorRueda = null;
  stageEl.addEventListener(
    "wheel",
    (ev) => {
      if (ev.ctrlKey) return;
      const delta = Math.abs(ev.deltaX) >= Math.abs(ev.deltaY) ? ev.deltaX : ev.deltaY;
      if (!delta) return;
      ev.preventDefault();
      marcarMoviendo(true);

      let nuevo = cf.estado.indiceActual + (delta / ESPACIADO) * SENSIBILIDAD_RUEDA;
      nuevo = Math.max(0, Math.min(cf.estado.items.length - 1, nuevo));
      cf.estado.indiceActual = nuevo;
      cf.render();

      clearTimeout(temporizadorRueda);
      temporizadorRueda = setTimeout(() => {
        marcarMoviendo(false);
        cf.irA(Math.round(cf.estado.indiceActual));
      }, 120);
    },
    { passive: false }
  );
}
