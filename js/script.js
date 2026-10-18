/* =========================================================
   Portafolio Jonathan Guamán — Lógica de tema y gamificación
   ========================================================= */

/* --- Modo claro / oscuro (persistente en localStorage) --- */
(function () {
  var KEY = "jg-tema";
  var btn = document.querySelector(".theme-toggle");

  function aplicar(tema) {
    document.documentElement.setAttribute("data-theme", tema);
    if (btn) {
      btn.setAttribute("aria-pressed", tema === "dark");
      btn.setAttribute("aria-label", tema === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
      var t = btn.querySelector(".toggle-text");
      if (t) t.textContent = tema === "dark" ? "Claro" : "Oscuro";
    }
  }

  var inicial;
  try { inicial = localStorage.getItem(KEY); } catch (e) { inicial = null; }
  if (inicial !== "dark" && inicial !== "light") {
    inicial = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  aplicar(inicial);

  if (btn) {
    btn.addEventListener("click", function () {
      var actual = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
      var nuevo = actual === "dark" ? "light" : "dark";
      try { localStorage.setItem(KEY, nuevo); } catch (e) {}
      aplicar(nuevo);
    });
  }
})();

/* --- Barras de progreso animadas (inglés y habilidades) --- */
(function () {
  var barras = document.querySelectorAll(".track i[data-value]");
  function llenar() {
    barras.forEach(function (barra) {
      var v = Number(barra.getAttribute("data-value"));
      barra.style.width = (v >= 0 && v <= 100 ? v : 0) + "%";
    });
  }
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    barras.forEach(function (b) { b.style.transition = "none"; });
    llenar();
  } else {
    requestAnimationFrame(function () { requestAnimationFrame(llenar); });
  }
})();

/* --- Gamificación: misiones guardadas en el navegador de cada visitante --- */
(function () {
  var KEY = "jg-misiones";
  var TOTAL = 5;
  var TITULOS = ["Visitante", "Explorador", "Explorador", "Colaborador", "Colaborador", "Perfil completo"];
  var hechas = leer();

  function leer() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
  }
  function guardar() {
    try { localStorage.setItem(KEY, JSON.stringify(hechas)); } catch (e) {}
  }
  function aviso(texto) {
    var t = document.createElement("div");
    t.className = "toast";
    t.setAttribute("role", "status");
    t.textContent = texto;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 3500);
  }
  function pintar() {
    var n = hechas.length;
    document.querySelectorAll(".xp-count").forEach(function (e) { e.textContent = n + "/" + TOTAL + " misiones · " + n * 20 + " XP"; });
    document.querySelectorAll(".xp-title").forEach(function (e) { e.textContent = TITULOS[n]; });
    document.querySelectorAll(".xp .bar i").forEach(function (e) { e.style.width = (n / TOTAL * 100) + "%"; });
    document.querySelectorAll("[data-quest]").forEach(function (li) {
      li.classList.toggle("done", hechas.indexOf(li.dataset.quest) > -1);
    });
  }
  function marcar(id) {
    if (hechas.indexOf(id) > -1) return;
    hechas.push(id);
    guardar();
    pintar();
    aviso(hechas.length === TOTAL ? "🏆 Insignia desbloqueada: Perfil completo" : "+20 XP · Misión cumplida (" + hechas.length + "/" + TOTAL + ")");
  }

  if (document.body.dataset.visit) marcar(document.body.dataset.visit);
  document.querySelectorAll("[data-mission-click]").forEach(function (el) {
    el.addEventListener("click", function () { marcar(el.dataset.missionClick); });
  });
  var form = document.querySelector("form");
  if (form) form.addEventListener("submit", function () { marcar("contacto"); });
  pintar();
})();
