(() => {
  'use strict';
  let data;
  const editor = document.querySelector('#editor');
  const message = document.querySelector('#message');
  const download = document.querySelector('#download');
  async function init() {
    try {
      const res = await fetch('./catalog-seed.json', {cache:'no-store'});
      if (!res.ok) throw new Error('HTTP ' + res.status);
      data = await res.json();
      if (!Array.isArray(data.juegos)) throw new Error('Formato inválido');
      data.juegos.forEach(g => {
        const section = document.createElement('section'); section.className = 'panel';
        const h = document.createElement('h2'); h.textContent = g.nombre; section.append(h);
        g.paquetes.forEach(p => {
          const label = document.createElement('label'); label.textContent = p[0] + ' — precio USD (vacío = no disponible)';
          const input = document.createElement('input'); input.type = 'number'; input.min = '0.01'; input.max = '100000'; input.step = '0.01';
          input.value = typeof p[1] === 'number' ? p[1].toFixed(2) : '';
          input.addEventListener('input', () => {
            if (input.value.trim() === '') { p[1] = null; input.setCustomValidity(''); }
            else { const n = Number(input.value); if (!Number.isFinite(n) || n <= 0 || n > 100000) {input.setCustomValidity('Introduce un precio positivo válido');} else {p[1] = Math.round(n*100)/100;input.setCustomValidity('');} }
          });
          section.append(label,input);
        });
        editor.append(section);
      });
      message.textContent = 'Catálogo listo para editar. Los precios no se publican hasta subir el JSON a GitHub.';
      download.disabled = false;
    } catch(e) { message.textContent = 'Error al abrir el catálogo: ' + e.message; }
  }
  download.addEventListener('click', () => {
    if (![...editor.querySelectorAll('input')].every(x => x.reportValidity())) return;
    const blob = new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'catalog-seed.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    message.textContent = 'Archivo descargado. Reemplaza catalog-seed.json en GitHub para publicar los precios.';
  });
  init();
})();
