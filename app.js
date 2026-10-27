(()=>{
'use strict';
const cfg=window.RECARGAS_LX,$=s=>document.querySelector(s);
let games=Array.isArray(cfg.juegos)?cfg.juegos:[],selected=null,pack=null,verified=false,tab='juegos';
const status=$('#status');
const category=g=>String(g.categoria||g.category||'juegos').toLowerCase().trim();
function draw(){
 const q=($('#search')?.value||'').toLowerCase().trim();
 $('#games').replaceChildren();
 for(const g of games.filter(x=>category(x)===tab&&String(x.nombre).toLowerCase().includes(q))){
  const el=document.createElement('article');el.className='game';
  if(g.imagen){const img=document.createElement('img');img.src=g.imagen;img.alt=g.nombre;img.loading='lazy';el.append(img)}else{const div=document.createElement('div');div.className='fallback';div.textContent='🎮 '+g.nombre;el.append(div)}
  const info=document.createElement('div');info.className='info';const h=document.createElement('h3');h.textContent=g.nombre;
  const p=document.createElement('p');p.textContent='Recargas y paquetes digitales';const btn=document.createElement('button');btn.className='pick';btn.textContent='Ver paquetes →';btn.onclick=()=>choose(g);
  info.append(h,p,btn);el.append(info);$('#games').append(el);
 }
}
function choose(g){
 selected=g;pack=null;
 const field=g.campo||(category(g)==='wallet'?'Correo Zinli':'Player ID');
 $('#idlabel').textContent=field;$('#player').placeholder='Ingresa '+field;$('#player').value='';
 $('#packages').replaceChildren();$('#summary').textContent='Selecciona un paquete';
 for(const p of (g.paquetes||[])){
  const b=document.createElement('button');b.className='package';b.textContent=p[0]+' · $'+Number(p[1]).toFixed(2);
  b.onclick=()=>{pack=p;document.querySelectorAll('.package').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');$('#summary').textContent=g.nombre+' — '+p[0]+' — $'+Number(p[1]).toFixed(2)};
  $('#packages').append(b);
 }
 document.querySelector('.panel')?.scrollIntoView({behavior:'smooth',block:'center'});
}
$('#search').oninput=draw;
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{
 tab=b.dataset.tab;document.querySelectorAll('[data-tab]').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('#search').value='';draw();
});
$('#order').onclick=()=>{
 if(!verified)return alert('Los precios no están sincronizados. Intenta más tarde.');
 if(!selected||!pack||!$('#player').value.trim())return alert('Selecciona producto, paquete y completa el campo solicitado');
 const field=selected.campo||(category(selected)==='wallet'?'Correo Zinli':'Jugador');
 const text=`Hola, quiero solicitar una recarga en RECARGAS LX.\nProducto: ${selected.nombre}\nPaquete: ${pack[0]}\nPrecio: $${Number(pack[1]).toFixed(2)}\n${field}: ${$('#player').value.trim()}\nPago: ${$('#payment').value}`;
 window.open('https://wa.me/'+cfg.whatsapp+'?text='+encodeURIComponent(text),'_blank','noopener');
};
async function init(){
 $('#order').disabled=true;draw();
 try{
  const r=await fetch(cfg.apiUrl.replace(/\/$/,'')+'/api/catalog',{headers:{Accept:'application/json'}});
  if(!r.ok)throw new Error('HTTP '+r.status);
  const data=await r.json();if(!Array.isArray(data.juegos))throw new Error('Formato de catálogo no reconocido');
  games=data.juegos.map(g=>({...g,imagen:cfg.juegos.find(x=>x.id===g.id)?.imagen||g.imagen,categoria:g.categoria||g.category||cfg.juegos.find(x=>x.id===g.id)?.categoria||'juegos',campo:g.campo||cfg.juegos.find(x=>x.id===g.id)?.campo}));
  verified=true;status.textContent='✓ Precios sincronizados';$('#order').disabled=false;draw();
 }catch(e){verified=false;status.textContent='No se pudieron cargar los precios actualizados. Pedidos temporalmente deshabilitados. Revisa Cloudflare Worker.';console.error('RECARGAS LX:',e)}
}
init();
})();
