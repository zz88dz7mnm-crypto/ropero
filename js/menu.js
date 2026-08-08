// Menú lateral (solo estructura por ahora). Cada botón dispara un evento
// custom "menu:accion" con el nombre de la acción — el día que se defina
// qué hace cada sección, se engancha ahí sin tocar este archivo.

document.addEventListener("DOMContentLoaded", () => {
  const btnMenu = document.getElementById("btn-menu");
  const overlay = document.getElementById("menu-overlay");
  const menu = document.getElementById("menu-lateral");

  function abrirMenu() {
    document.body.classList.add("menu-abierto");
    btnMenu.setAttribute("aria-expanded", "true");
    menu.setAttribute("aria-hidden", "false");
  }

  function cerrarMenu() {
    document.body.classList.remove("menu-abierto");
    btnMenu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-hidden", "true");
  }

  function toggleMenu() {
    const abierto = document.body.classList.contains("menu-abierto");
    if (abierto) cerrarMenu();
    else abrirMenu();
  }

  btnMenu.addEventListener("click", toggleMenu);
  overlay.addEventListener("click", cerrarMenu);
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") cerrarMenu();
  });

  document.querySelectorAll(".menu-item").forEach((item) => {
    item.addEventListener("click", () => {
      const accion = item.dataset.accion;
      document.dispatchEvent(new CustomEvent("menu:accion", { detail: { accion } }));
      cerrarMenu();
    });
  });
});
