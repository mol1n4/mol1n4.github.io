/* Cuenta atrás: viernes que faltan para el Viernes Santo.
   Es automática: calcula cada año el Domingo de Pascua (calendario gregoriano) y de ahí el Viernes Santo.
   Cuando pasa el Viernes Santo, pasa sola a contar hacia el del año siguiente.
   No usa cookies ni servicios externos. Si el navegador no ejecuta JavaScript, el bloque simplemente no se muestra. */
(function () {
  'use strict';

  var DIA = 86400000;

  // Domingo de Pascua (algoritmo de Meeus/Jones/Butcher). Devuelve milisegundos UTC a medianoche.
  function pascua(y) {
    var a = y % 19,
        b = Math.floor(y / 100),
        c = y % 100,
        d = Math.floor(b / 4),
        e = b % 4,
        f = Math.floor((b + 8) / 25),
        g = Math.floor((b - f + 1) / 3),
        h = (19 * a + b - d - g + 15) % 30,
        i = Math.floor(c / 4),
        k = c % 4,
        l = (32 + 2 * e + 2 * i - h - k) % 7,
        m = Math.floor((a + 11 * h + 22 * l) / 451),
        mes = Math.floor((h + l - 7 * m + 114) / 31),
        dia = ((h + l - 7 * m + 114) % 31) + 1;
    return Date.UTC(y, mes - 1, dia);
  }

  function viernesSanto(y) {
    return pascua(y) - 2 * DIA;
  }

  // Fecha de hoy en Madrid, para que no dependa de la zona horaria ni del cambio de hora.
  function hoyEnMadrid() {
    var d = new Date(), p;
    try {
      p = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit'
      }).format(d).split('-');
      return { y: +p[0], t: Date.UTC(+p[0], +p[1] - 1, +p[2]) };
    } catch (e) {
      return { y: d.getFullYear(), t: Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) };
    }
  }

  // Devuelve { dias, viernes }: días hasta el próximo Viernes Santo y cuántos viernes quedan hasta él (incluido).
  function calcular(hoy) {
    var vs = viernesSanto(hoy.y);
    if (hoy.t > vs) vs = viernesSanto(hoy.y + 1);
    var dias = Math.round((vs - hoy.t) / DIA);
    return { dias: dias, viernes: Math.ceil(dias / 7) };
  }

  function pintar(el, r) {
    var linea = el.querySelector('.cuenta__linea');
    if (!linea) return;
    linea.textContent = '';

    function span(clase, texto) {
      var s = document.createElement('span');
      s.className = clase;
      s.textContent = texto;
      linea.appendChild(s);
      return s;
    }

    if (r.dias === 0) {
      span('cuenta__txt cuenta__txt--solo', 'Hoy es Viernes Santo');
    } else if (r.dias === 1) {
      span('cuenta__txt cuenta__txt--solo', 'Mañana es Viernes Santo');
    } else if (r.viernes <= 1) {
      span('cuenta__txt cuenta__txt--solo', 'El próximo viernes es Viernes Santo');
    } else {
      span('cuenta__sr', 'Faltan ');
      span('cuenta__num', r.viernes + ' ');   // el espacio final solo lo notan los lectores de pantalla
      span('cuenta__txt', 'viernes para el Viernes Santo');
    }
    el.hidden = false;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { pascua: pascua, viernesSanto: viernesSanto, calcular: calcular };
    return;
  }

  var el = document.getElementById('cuenta');
  if (el) pintar(el, calcular(hoyEnMadrid()));
})();
