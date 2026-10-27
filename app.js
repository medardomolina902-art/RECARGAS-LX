
(() => {
  'use strict';

  const cfg = window.RECARGAS_LX || {};
  const $ = selector => document.querySelector(selector);

  let games = [];
  let selected = null;
  let pack = null;
  let verified = false;
  let tab = 'juegos';

  const status = $('#status');
  const grid = $('#games');
  const packages = $('#packages');
  const order = $('#order');
  const summary = $('#summary');

  const validPrice = value =>
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value > 0;

  const money = value => '$' + value.toFixed(2);

  const category = game =>
    String(game.categoria || 'juegos')
      .toLowerCase()
      .trim();

  function draw() {
    if (!grid) return;

    const search = ($('#search')?.value || '')
      .toLowerCase()
      .trim();

    grid.replaceChildren();

    const visible = games.filter(game =>
      category(game) === tab &&
      String(game.nombre || '')
        .toLowerCase()
        .includes(search)
    );

    for (const game of visible) {
      const card = document.createElement('article');
      card.className = 'game';

      const imagePath =
        game.imagen ||
        cfg.imagenes?.[game.id] ||
        '';

      if (imagePath) {
        const img = document.createElement('img');
        img.src = imagePath;
        img.alt = game.nombre;
        img.loading = 'lazy';
        img.style.objectFit = 'contain';

        img.onerror = () => {
          img.remove();

          const fallback = document.createElement('div');
          fallback.className = 'fallback';
          fallback.textContent = '🎮 ' + game.nombre;
          card.prepend(fallback);
        };

        card.append(img);
      } else {
        const fallback = document.createElement('div');
        fallback.className = 'fallback';
        fallback.textContent = '🎮 ' + game.nombre;
        card.append(fallback);
      }

      const info = document.createElement('div');
      info.className = 'info';

      const title = document.createElement('h3');
      title.textContent = game.nombre;

      const description = document.createElement('p');
      description.textContent = 'Recargas y paquetes digitales';

      const button = document.createElement('button');
      button.className = 'pick';
      button.textContent = 'Ver paquetes →';
      button.onclick = () => choose(game);

      info.append(title, description, button);
      card.append(info);
      grid.append(card);
    }

    if (!visible.length) {
      const empty = document.createElement('p');
      empty.textContent = 'No hay productos disponibles.';
      grid.append(empty);
    }
  }

  function choose(game) {
    selected = game;
    pack = null;

    const field = game.campo || 'Player ID';

    $('#idlabel').textContent = field;
    $('#player').placeholder = 'Ingresa ' + field;
    $('#player').value = '';

    packages.replaceChildren();
    summary.textContent = 'Selecciona un paquete';
    order.disabled = true;

    for (const item of game.paquetes || []) {
      if (!Array.isArray(item) || item.length < 2) continue;

      const button = document.createElement('button');
      button.className = 'package';

      const available = validPrice(item[1]);

      button.textContent = item[0] + ' · ' +
        (available ? money(item[1]) : 'Precio pendiente');

      button.disabled = !available;

      button.onclick = () => {
        pack = item;

        packages
          .querySelectorAll('.package')
          .forEach(element =>
            element.classList.remove('selected')
          );

        button.classList.add('selected');

        summary.textContent =
          game.nombre + ' — ' +
          item[0] + ' — ' +
          money(item[1]);

        order.disabled = !verified;
      };

      packages.append(button);
    }

    $('#selection')?.removeAttribute('hidden');

    (
      $('#selection') ||
      document.querySelector('.panel')
    )?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  $('#search')?.addEventListener('input', draw);

  document.querySelectorAll('[data-tab]').forEach(button => {
    button.addEventListener('click', () => {
      tab = button.dataset.tab;

      document.querySelectorAll('[data-tab]')
        .forEach(element =>
          element.classList.toggle(
            'active',
            element === button
          )
        );

      if ($('#search')) $('#search').value = '';

      draw();
    });
  });

  order?.addEventListener('click', () => {
    if (!verified) {
      alert('El catálogo todavía no está disponible.');
      return;
    }

    if (!selected || !pack || !validPrice(pack[1])) {
      alert('Selecciona un paquete con precio disponible.');
      return;
    }

    const player = $('#player')?.value.trim() || '';

    if (!player) {
      alert('Completa el campo: ' + selected.campo);
      return;
    }

    if (
      selected.id === 'zinli' &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(player)
    ) {
      alert('Escribe un correo Zinli válido.');
      return;
    }

    const payment = $('#payment')?.value || 'Por confirmar';

    const message = [
      `Hola, quiero solicitar una recarga en ${cfg.nombre}.`,
      `Producto: ${selected.nombre}`,
      `Paquete: ${pack[0]}`,
      `Precio: ${money(pack[1])}`,
      `${selected.campo || 'Jugador'}: ${player}`,
      `Método de pago: ${payment}`
    ].join('\n');

    const whatsapp = String(cfg.whatsapp || '')
      .replace(/\D/g, '');

    if (!whatsapp) {
      alert('WhatsApp no está configurado.');
      return;
    }

    const url =
      'https://wa.me/' +
      whatsapp +
      '?text=' +
      encodeURIComponent(message);

    window.open(url, '_blank', 'noopener,noreferrer');
  });

  async function init() {
    verified = false;
    if (order) order.disabled = true;

    if (status) {
      status.textContent = 'Cargando precios...';
    }

    try {
      const url = cfg.catalogUrl || './catalog-seed.json';

      const response = await fetch(url, {
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }

      const data = await response.json();

      if (!Array.isArray(data.juegos)) {
        throw new Error('Catálogo inválido');
      }

      games = data.juegos;

      verified = true;

      if (status) {
        status.textContent =
          '✓ Catálogo actualizado desde Netlify';
      }

      draw();

    } catch (error) {
      verified = false;
      games = [];

      if (order) order.disabled = true;

      if (status) {
        status.textContent =
          'No se pudo cargar el catálogo local. ' +
          'Revisa catalog-seed.json en Netlify.';
      }

      console.error('RECARGAS LX:', error);
      draw();
    }
  }

  init();
})();
