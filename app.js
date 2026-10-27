
(() => {
  'use strict';

  // ==========================================
  // RECARGAS LX - CONFIGURACIÓN GENERAL
  // ==========================================

  const cfg = window.RECARGAS_LX || {};
  const $ = selector => document.querySelector(selector);

  let games = [];
  let selected = null;
  let pack = null;
  let loaded = false;
  let tab = 'juegos';

  const status = $('#status');
  const grid = $('#games');
  const packages = $('#packages');
  const order = $('#order');
  const summary = $('#summary');
  const selection = $('#selection');
  const playerInput = $('#player');
  const idLabel = $('#idlabel');

  // ==========================================
  // IMÁGENES DE PRODUCTOS
  // ==========================================

  const imagenesLocales = {
    freefire: 'assets/free-fire.png',
    bloodstrike: 'assets/blood-strike.png',
    roblox: 'assets/roblox.png',
    mobilelegends: 'assets/mobile-legends.png',
    pubgmobile: 'assets/pubg-mobile.png',
    callofdutymobile: 'assets/call-of-duty-mobile.png',
    zinli: 'assets/zinli.png'
  };

  const normalizarId = valor => String(valor || '')
    .toLowerCase().replace(/[^a-z0-9]/g, '');

  function rutaImagen(game) {
    const clave = normalizarId(game.id);
    const porNombre = normalizarId(game.nombre);
    return imagenesLocales[clave] || imagenesLocales[porNombre] ||
      game.imagen || cfg.imagenes?.[game.id] || '';
  }

  // Ajustar imágenes sin modificar el resto de las tarjetas.
  const estiloFotos = document.createElement('style');
  estiloFotos.textContent = `
    #games .game > img {
      display: block;
      width: 100%;
      height: 260px;
      object-fit: contain;
      object-position: center;
      background: #110717;
      border-radius: 14px 14px 0 0;
    }
    @media (max-width: 600px) {
      #games .game > img { height: 210px; }
    }
  `;
  document.head.appendChild(estiloFotos);

  // ==========================================
  // FUNCIONES GENERALES
  // ==========================================

  const validPrice = value =>
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value > 0;

  const money = value =>
    '$' + value.toFixed(2);

  const category = game =>
    String(game.categoria || 'juegos')
      .toLowerCase()
      .trim();

  const isZinli = game =>
    String(game?.id || '').toLowerCase() === 'zinli';

  function showStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function updateOrderButton() {
    if (!order) return;

    order.disabled =
      !loaded ||
      !selected ||
      !pack ||
      !validPrice(pack[1]);
  }

  // ==========================================
  // IMAGEN ALTERNATIVA
  // ==========================================

  function createFallback(game, card) {
    const fallback = document.createElement('div');

    fallback.className = 'fallback';
    fallback.textContent = '🎮 ' + game.nombre;

    card.prepend(fallback);
  }

  // ==========================================
  // MOSTRAR PRODUCTOS
  // ==========================================

  function draw() {
    if (!grid) return;

    const search = ($('#search')?.value || '')
      .toLocaleLowerCase('es')
      .trim();

    grid.replaceChildren();

    const visible = games.filter(game =>
      category(game) === tab &&
      String(game.nombre || '')
        .toLocaleLowerCase('es')
        .includes(search)
    );

    for (const game of visible) {
      const card = document.createElement('article');
      card.className = 'game';

      // Imagen correcta según producto
      const imagePath = rutaImagen(game);

      if (imagePath) {
        const img = document.createElement('img');

        img.src = imagePath;
        img.alt = game.nombre;
        img.loading = 'lazy';

        img.onerror = () => {
          img.remove();
          createFallback(game, card);
        };

        card.append(img);
      } else {
        createFallback(game, card);
      }

      const info = document.createElement('div');
      info.className = 'info';

      const title = document.createElement('h3');
      title.textContent = game.nombre;

      const description = document.createElement('p');

      description.textContent = isZinli(game)
        ? 'Recarga de saldo Zinli por correo'
        : 'Recargas y paquetes digitales';

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

      empty.textContent = loaded
        ? 'No hay productos en esta sección.'
        : 'No hay productos disponibles.';

      grid.append(empty);
    }
  }

  // ==========================================
  // SELECCIÓN DE PRODUCTO
  // ==========================================

  function choose(game) {
    selected = game;
    pack = null;

    const zinli = isZinli(game);

    // Zinli siempre solicita solo correo
    const field = zinli
      ? 'Correo electrónico Zinli'
      : (game.campo || 'Player ID');

    if (idLabel) {
      idLabel.textContent = field;
    }

    if (playerInput) {
      playerInput.value = '';

      playerInput.type = zinli
        ? 'email'
        : 'text';

      playerInput.placeholder = zinli
        ? 'correo@ejemplo.com'
        : 'Ingresa ' + field;

      playerInput.autocomplete = zinli
        ? 'email'
        : 'off';

      playerInput.required = true;
    }

    if (packages) {
      packages.replaceChildren();
    }

    if (summary) {
      summary.textContent = 'Selecciona un paquete';
    }

    updateOrderButton();

    // ========================================
    // PAQUETES Y PRECIOS
    // ========================================

    for (const item of game.paquetes || []) {
      if (
        !Array.isArray(item) ||
        item.length < 2
      ) {
        continue;
      }

      const button = document.createElement('button');
      button.className = 'package';

      const available = validPrice(item[1]);

      button.textContent =
        item[0] + ' · ' +
        (available
          ? money(item[1])
          : 'Precio pendiente');

      button.disabled = !available;

      button.onclick = () => {
        pack = item;

        packages
          ?.querySelectorAll('.package')
          .forEach(element => {
            element.classList.remove('selected');
          });

        button.classList.add('selected');

        if (summary) {
          summary.textContent =
            game.nombre + ' — ' +
            item[0] + ' — ' +
            money(item[1]);
        }

        updateOrderButton();
      };

      packages?.append(button);
    }

    if (selection) {
      selection.hidden = false;
    }

    (
      selection ||
      document.querySelector('.panel')
    )?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  // ==========================================
  // BUSCADOR
  // ==========================================

  $('#search')?.addEventListener('input', draw);

  // ==========================================
  // CATEGORÍAS
  // ==========================================

  document.querySelectorAll('[data-tab]')
    .forEach(button => {
      button.addEventListener('click', () => {
        tab = button.dataset.tab;

        document.querySelectorAll('[data-tab]')
          .forEach(element => {
            element.classList.toggle(
              'active',
              element === button
            );
          });

        const searchInput = $('#search');

        if (searchInput) {
          searchInput.value = '';
        }

        draw();
      });
    });

  // ==========================================
  // PEDIDOS POR WHATSAPP
  // ==========================================

  order?.addEventListener('click', () => {
    if (!loaded) {
      alert('El catálogo todavía no está disponible.');
      return;
    }

    if (
      !selected ||
      !pack ||
      !validPrice(pack[1])
    ) {
      alert('Selecciona un paquete disponible.');
      return;
    }

    const zinli = isZinli(selected);

    const player = playerInput?.value.trim() || '';

    const field = zinli
      ? 'Correo electrónico Zinli'
      : (selected.campo || 'Player ID');

    if (!player) {
      alert('Completa el campo: ' + field);
      playerInput?.focus();
      return;
    }

    // Validar correo Zinli
    if (
      zinli &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(player)
    ) {
      alert('Escribe un correo electrónico válido.');
      playerInput?.focus();
      return;
    }

    const payment =
      $('#payment')?.value || 'Por confirmar';

    const message = [
      'Hola, quiero solicitar una recarga en ' +
        (cfg.nombre || 'RECARGAS LX') + '.',
      '',
      'Producto: ' + selected.nombre,
      'Paquete: ' + pack[0],
      'Precio: ' + money(pack[1]),
      field + ': ' + player,
      'Método de pago: ' + payment
    ].join('\n');

    const whatsapp = String(cfg.whatsapp || '')
      .replace(/\D/g, '');

    if (!whatsapp) {
      alert(
        'El número de WhatsApp no está configurado.'
      );
      return;
    }

    const url =
      'https://wa.me/' +
      whatsapp +
      '?text=' +
      encodeURIComponent(message);

    window.open(
      url,
      '_blank',
      'noopener,noreferrer'
    );
  });

  // ==========================================
  // CARGAR CATÁLOGO LOCAL
  // ==========================================

  async function init() {
    loaded = false;
    updateOrderButton();

    showStatus('Cargando precios...');

    try {
      const url =
        cfg.catalogUrl || './catalog-seed.json';

      const response = await fetch(url, {
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }

      const data = await response.json();

      if (!Array.isArray(data.juegos)) {
        throw new Error(
          'Formato de catálogo inválido'
        );
      }

      games = data.juegos.filter(game =>
        game &&
        typeof game.id === 'string' &&
        typeof game.nombre === 'string' &&
        Array.isArray(game.paquetes)
      );

      loaded = true;

      showStatus(
        '✓ Precios actualizados desde Netlify'
      );

      draw();

    } catch (error) {
      loaded = false;
      games = [];

      updateOrderButton();

      showStatus(
        'No se pudo cargar el catálogo local. ' +
        'Revisa catalog-seed.json.'
      );

      console.error('RECARGAS LX:', error);

      draw();
    }
  }


  // ==========================================
  // IDENTIDAD VISUAL: LOGO Y BANNER RECARGAS LX
  // Archivos requeridos dentro de assets/
  // ==========================================
  function instalarImagenesMarca() {
    const css = document.createElement('style');
    css.textContent = `
      .lx-logo-marca { display:block; width:auto; max-width:min(250px, 55vw); height:52px; object-fit:contain; object-position:left center; }
      .lx-banner-imagen { display:block; width:100%; height:auto; object-fit:contain; }
      .lx-banner-contenedor { padding:0 !important; overflow:hidden; background:#100018 !important; min-height:0 !important; }
      .lx-banner-contenedor > .lx-banner-imagen { border-radius:inherit; }
      @media(max-width:600px) { .lx-logo-marca { height:38px; max-width:180px; } }
    `;
    document.head.appendChild(css);

    // Encontrar el encabezado por el texto visible, sin depender de una clase.
    const candidatos = [...document.querySelectorAll('header a, header strong, header b, header h1, header h2, header span, .brand, .logo')];
    const marca = candidatos.find(el => el.children.length === 0 && /RECARGAS\s*LX/i.test(el.textContent || ''));
    if (marca) {
      const img = document.createElement('img');
      img.src = './assets/logo-recargas-lx.png';
      img.alt = 'RECARGAS LX';
      img.className = 'lx-logo-marca';
      img.onerror = () => { img.replaceWith(document.createTextNode('⚡ RECARGAS LX')); };
      marca.replaceChildren(img);
    }

    // Sustituir solamente el cuadro del título RECARGAS GAMER.
    const titulo = [...document.querySelectorAll('h1, h2, h3')]
      .find(el => /RECARGAS\s+GAMER/i.test(el.textContent || ''));
    if (titulo) {
      const contenedor = titulo.closest('.hero, .banner, .hero-banner, section') || titulo.parentElement;
      if (contenedor) {
        const copia = [...contenedor.childNodes];
        const img = document.createElement('img');
        img.src = './assets/banner-recargas-gamer.png';
        img.alt = 'RECARGAS GAMER - Free Fire, Blood Strike y Roblox';
        img.className = 'lx-banner-imagen';
        img.onerror = () => {
          contenedor.replaceChildren(...copia);
          contenedor.classList.remove('lx-banner-contenedor');
        };
        contenedor.classList.add('lx-banner-contenedor');
        contenedor.replaceChildren(img);
      }
    }
  }

  instalarImagenesMarca();

  // ==========================================
  // INICIAR SISTEMA
  // ==========================================

  init();

})();
