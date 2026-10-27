(() => {
  'use strict';
  const cfg = window.RECARGAS_LX;
  const $ = s => document.querySelector(s);
  let games = [], tab = 'juegos', selected = null, pack = null;
  const validPrice = n => typeof n === 'number' && Number.isFinite(n) && n > 0;
  const money = n => '$' + n.toFixed(2);
  const status = $('#status');
  const packages = $('#packages');
  const order = $('#order');
  const info = $('#selection');
  const summary = $('#summary');
  function draw() {
    const q = $('#search').value.trim().toLocaleLowerCase('es');
    const grid = $('#games');
    grid.replaceChildren();
    const visible = games.filter(g => (g.categoria || 'juegos') === tab && g.nombre.toLocaleLowerCase('es').includes(q));
    for (const g of visible) {
      const card = document.createElement('article');
      card.className = 'game';
      const img = document.createElement('img');
      img.src = cfg.imagenes[g.id] || 'assets/banner.webp';
      img.alt = g.nombre;
      img.loading = 'lazy';
      img.onerror = () => { img.remove(); const fallback = document.createElement('div'); fallback.className = 'fallback'; fallback.textContent = '🎮 ' + g.nombre; card.prepend(fallback); };
      const box = document.createElement('div'); box.className = 'info';
      const name = document.createElement('h3'); name.textContent = g.nombre;
      const desc = document.createElement('p'); desc.textContent = 'Recargas y paquetes digitales';
      const btn = document.createElement('button'); btn.textContent = 'Ver paquetes →'; btn.onclick = () => choose(g);
      box.append(name, desc, btn); card.append(img, box); grid.append(card);
    }
    if (!visible.length) { const p = document.createElement('p'); p.textContent = 'No hay productos en esta sección.'; grid.append(p); }
  }
  function choose(g) {
    selected = g; pack = null; order.disabled = true;
    info.hidden = false;
    $('#idlabel').textContent = g.campo || 'Player ID';
    $('#player').placeholder = 'Ingresa ' + (g.campo || 'Player ID');
    $('#player').value = '';
    summary.textContent = 'Selecciona un paquete';
    packages.replaceChildren();
    for (const p of g.paquetes) {
      const b = document.createElement('button'); b.className = 'package';
      const available = validPrice(p[1]);
      b.textContent = p[0] + (available ? ' · ' + money(p[1]) : ' · Precio pendiente');
      b.disabled = !available;
      b.onclick = () => {
        pack = p;
        packages.querySelectorAll('.package').forEach(x => x.classList.remove('selected'));
        b.classList.add('selected');
        summary.textContent = g.nombre + ' — ' + p[0] + ' — ' + money(p[1]);
        order.disabled = false;
      };
      packages.append(b);
    }
    info.scrollIntoView({behavior:'smooth',block:'start'});
  }
  document.querySelectorAll('[data-tab]').forEach(btn => btn.addEventListener('click', () => {
    tab = btn.dataset.tab;
    document.querySelectorAll('[data-tab]').forEach(x => x.classList.toggle('active', x === btn));
    $('#search').value = '';
    draw();
  }));
  $('#search').addEventListener('input', draw);
  order.addEventListener('click', () => {
    const player = $('#player').value.trim();
    if (!selected || !pack || !validPrice(pack[1])) return alert('Selecciona un paquete con precio disponible.');
    if (!player) return alert('Completa el campo: ' + selected.campo);
    if (selected.id === 'zinli' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(player)) return alert('Escribe un correo Zinli válido.');
    const msg = `Hola, quiero solicitar una recarga en ${cfg.nombre}.\nProducto: ${selected.nombre}\nPaquete: ${pack[0]}\nPrecio: ${money(pack[1])}\n${selected.campo}: ${player}\nMétodo de pago: ${$('#payment').value}`;
    window.open('https://wa.me/' + cfg.whatsapp + '?text=' + encodeURIComponent(msg), '_blank', 'noopener,noreferrer');
  });
  async function init() {
    try {
      const r = await fetch(cfg.catalogUrl, {cache:'no-store'});
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const data = await r.json();
      if (!Array.isArray(data.juegos)) throw new Error('Catálogo inválido');
      games = data.juegos;
      status.textContent = '✓ Catálogo local cargado desde Netlify';
      draw();
    } catch(e) {
      status.textContent = 'No se pudo cargar catalog-seed.json. Revisa que esté publicado junto a index.html.';
      console.error('RECARGAS LX:',e);
    }
  }
  init();
})();
