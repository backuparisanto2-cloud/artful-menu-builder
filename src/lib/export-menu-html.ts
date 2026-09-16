import { IMAGE_WIDTH, IMAGE_HEIGHT, type MenuPage } from "@/data/menu-pages";

function absolute(url: string) {
  if (typeof window === "undefined") return url;
  if (/^(https?:|data:|blob:|images\/)/.test(url)) return url;
  return new URL(url, window.location.origin).href;
}

const ICONS = {
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m18 6-12 12M6 6l12 12"/></svg>',
  up: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg>',
  left: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
  right: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
  download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"/></svg>',
  heart: '<svg class="heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"/></svg>',
  whatsapp:
    '<svg class="wa-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22c5.46 0 9.92-4.45 9.92-9.93C21.96 6.45 17.5 2 12.04 2Zm0 18.02a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.25-4.35c0-4.54 3.7-8.23 8.24-8.23a8.24 8.24 0 0 1 0 16.44Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.09-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.22.25-.85.84-.85 2.04s.87 2.37 1 2.53c.12.17 1.71 2.61 4.14 3.66.58.25 1.03.4 1.38.51.58.19 1.11.16 1.53.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z"/></svg>',
};

export function buildMenuHtml(pages: MenuPage[]) {
  const items = pages
    .map(
      (p, i) => `    <figure id="${p.id}" data-id="${p.id}" data-i="${i}" style="--delay:${Math.min(i, 4) * 70}ms">
      <button class="image-button" type="button" data-open="${i}" aria-label="Lihat ${p.title} layar penuh">
        <img src="${absolute(p.url)}" alt="${p.title} — ${p.subtitle}" width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy" fetchpriority="low"'} decoding="async" />
      </button>
      <button class="share" type="button" data-share="${i}" aria-label="Bagikan ${p.title} via WhatsApp">${ICONS.whatsapp}</button>
      <button class="fav" type="button" data-fav="${p.id}" aria-label="Tandai favorit ${p.title}" aria-pressed="false">${ICONS.heart}</button>
    </figure>`,
    )
    .join("\n");

  const navItems = pages
    .map(
      (p, i) => `<button class="nav-item" type="button" data-go="${p.id}">
        <span class="nav-number">${i + 1}</span>
        <span class="nav-copy"><strong>${p.title}</strong><small>${p.subtitle}</small></span>
        <span class="nav-heart" aria-hidden="true">${ICONS.heart}</span>
      </button>`,
    )
    .join("\n");

  const data = JSON.stringify(
    pages.map((p) => ({ id: p.id, url: absolute(p.url), title: p.title, alt: `${p.title} — ${p.subtitle}` })),
  ).replace(/</g, "\\u003c");

  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="theme-color" content="#faf5ea" />
<title>Menu Kantin Inyong — Sate Kambing Muda Purwokerto</title>
<style>
  :root { color-scheme:light; --paper:#faf5ea; --brown:#5a3521; --green:#7ba428; --red:#e03131; --wa:#25d366; }
  * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
  html { scroll-behavior:smooth; }
  body { margin:0; min-height:100vh; background:var(--paper); color:var(--brown); font-family:system-ui,-apple-system,"Segoe UI",sans-serif; }
  button { font:inherit; cursor:pointer; }
  svg { display:block; width:20px; height:20px; fill:none; stroke:currentColor; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }
  .wa-icon { fill:currentColor; stroke:none; }
  .round { border:0; border-radius:999px; display:grid; place-items:center; }
  #menu-open { position:fixed; left:12px; top:12px; z-index:40; padding:12px; color:var(--paper); background:color-mix(in srgb,var(--brown) 90%,transparent); box-shadow:0 10px 15px -3px rgb(0 0 0/.1); backdrop-filter:blur(8px); }
  main { display:flex; flex-direction:column; gap:15px; width:100%; max-width:768px; margin:0 auto; padding:15px 0; }
  figure { position:relative; margin:0; opacity:0; transform:translate3d(0,52px,0) scale(.955); transition:opacity 540ms cubic-bezier(.2,.7,.15,1.03) var(--delay),transform 540ms cubic-bezier(.2,.7,.15,1.03) var(--delay); contain:content; }
  figure.in { opacity:1; transform:none; }
  .image-button { display:block; width:100%; padding:0; border:0; background:transparent; cursor:zoom-in; }
  figure img { display:block; width:100%; height:auto; aspect-ratio:${IMAGE_WIDTH}/${IMAGE_HEIGHT}; object-fit:cover; }
  .fav,.share { position:absolute; right:12px; z-index:2; width:40px; height:40px; padding:10px; border:0; border-radius:999px; color:#fff; transition:transform .15s ease; }
  .fav:active,.share:active,.lb-action:active { transform:scale(.9); }
  .fav { top:12px; background:rgb(0 0 0/.35); backdrop-filter:blur(5px); }
  .fav .heart,.nav-heart .heart { fill:transparent; }
  .fav.on .heart,#lbfav.on .heart { color:var(--red); fill:var(--red); transform:scale(1.1); }
  .share { top:62px; background:var(--wa); box-shadow:0 4px 6px -1px rgb(0 0 0/.16); animation:wa-bounce 1.8s ease-in-out infinite; }
  footer { padding:16px 12px 40px; text-align:center; font-size:12px; color:color-mix(in srgb,var(--brown) 70%,transparent); }
  #to-top { display:none; position:fixed; right:16px; bottom:16px; z-index:40; padding:12px; color:#fff; background:var(--green); box-shadow:0 10px 15px -3px rgb(0 0 0/.15); }
  #to-top.show { display:grid; animation:fade-in .3s ease-out; }
  #sidebar-shell { display:none; position:fixed; inset:0; z-index:50; }
  #sidebar-shell.open { display:block; }
  #scrim { position:absolute; inset:0; border:0; background:rgb(0 0 0/.4); animation:fade .2s ease; }
  #sidebar { position:absolute; left:0; top:0; width:82%; max-width:320px; height:100%; display:flex; flex-direction:column; background:var(--paper); box-shadow:0 20px 25px -5px rgb(0 0 0/.18); animation:slide-in .2s ease-out; }
  .side-head { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-bottom:1px solid rgb(90 53 33/.15); }
  .side-head strong { display:block; font-size:16px; }
  .side-head small { display:block; margin-top:2px; font-size:12px; color:rgb(90 53 33/.7); }
  #menu-close { padding:8px; border:0; color:var(--brown); background:transparent; }
  .side-tools { display:flex; gap:8px; padding:12px 16px; }
  .side-tools button { min-height:36px; border:0; border-radius:999px; padding:8px 12px; font-size:12px; font-weight:700; }
  #only-favs { flex:1; color:var(--brown); background:rgb(90 53 33/.1); }
  #only-favs.on { color:#fff; background:var(--green); }
  #save-html { display:flex; align-items:center; gap:4px; color:var(--paper); background:var(--brown); }
  #save-html svg { width:16px; height:16px; }
  #side-nav { flex:1; overflow-y:auto; padding:0 8px 24px; }
  .nav-item { display:flex; width:100%; align-items:flex-start; gap:12px; padding:10px 12px; border:0; border-radius:12px; color:var(--brown); background:transparent; text-align:left; }
  .nav-item:hover { background:rgb(90 53 33/.08); }
  .nav-item.hidden { display:none; }
  .nav-number { min-width:24px; margin-top:2px; padding:1px 6px; border-radius:6px; color:#4d6b18; background:rgb(123 164 40/.2); font-size:12px; font-weight:700; text-align:center; }
  .nav-copy { min-width:0; flex:1; }
  .nav-copy strong,.nav-copy small { display:block; }
  .nav-copy strong { overflow:hidden; font-size:14px; text-overflow:ellipsis; white-space:nowrap; }
  .nav-copy small { margin-top:2px; font-size:12px; color:rgb(90 53 33/.65); }
  .nav-heart { display:none; margin-top:2px; color:var(--red); }
  .nav-heart .heart { width:16px; height:16px; fill:var(--red); }
  .nav-item.is-fav .nav-heart { display:block; }
  #empty-favs { display:none; padding:24px 12px; text-align:center; font-size:12px; color:rgb(90 53 33/.6); }
  #lb { display:none; position:fixed; inset:0; z-index:60; flex-direction:column; color:#fff; background:rgb(0 0 0/.95); }
  #lb.open { display:flex; animation:fade .2s ease; }
  #lbbar { display:flex; align-items:center; justify-content:space-between; padding:12px; }
  #lbcount { font-size:12px; font-weight:600; color:rgb(255 255 255/.8); }
  .lb-actions { display:flex; gap:8px; }
  .lb-action { width:40px; height:40px; padding:10px; border:0; border-radius:999px; color:#fff; background:rgb(255 255 255/.1); transition:transform .15s ease; }
  #lbwa { background:var(--wa); animation:wa-bounce 1.8s ease-in-out infinite; }
  #lbstage { position:relative; flex:1; overflow:hidden; touch-action:none; user-select:none; }
  #lbwrap { display:flex; width:100%; height:100%; align-items:center; justify-content:center; transform-origin:0 0; will-change:transform; }
  #lbimg { display:block; width:auto; height:auto; max-width:100%; max-height:100%; object-fit:contain; }
  .lb-arrow { display:none; position:absolute; top:50%; width:40px; height:40px; padding:8px; border:0; border-radius:999px; color:#fff; background:rgb(255 255 255/.1); transform:translateY(-50%); }
  #lbprev { left:8px; } #lbnext { right:8px; }
  #lbhint { margin:0; padding:8px 16px 20px; text-align:center; font-size:11px; color:rgb(255 255 255/.6); }
  @keyframes fade { from{opacity:0} to{opacity:1} }
  @keyframes fade-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
  @keyframes slide-in { from{transform:translateX(-100%)} to{transform:none} }
  @keyframes pop { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:none} }
  @keyframes wa-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
  @media (min-width:640px) { main{gap:24px;padding:24px 16px} figure img{border-radius:16px}.lb-arrow{display:grid;place-items:center} }
  @media (prefers-reduced-motion:reduce) { html{scroll-behavior:auto} *,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important} figure{opacity:1;transform:none} }
</style>
</head>
<body>
<button id="menu-open" class="round" type="button" aria-label="Buka daftar halaman">${ICONS.menu}</button>
<main>${items}
  <footer>Umaeh Inyong · Jl. Gatot Subroto, Hetero Space, Purwokerto · 0851 0075 9000</footer>
</main>
<button id="to-top" class="round" type="button" aria-label="Kembali ke atas">${ICONS.up}</button>
<div id="sidebar-shell" aria-hidden="true">
  <button id="scrim" type="button" aria-label="Tutup menu"></button>
  <aside id="sidebar" aria-label="Daftar halaman menu">
    <div class="side-head"><div><strong>Kantin Inyong</strong><small>Daftar halaman menu</small></div><button id="menu-close" type="button" aria-label="Tutup menu">${ICONS.close}</button></div>
    <div class="side-tools"><button id="only-favs" type="button">Favorit saja (<span id="fav-count">0</span>)</button><button id="save-html" type="button">${ICONS.download} HTML</button></div>
    <nav id="side-nav">${navItems}<p id="empty-favs">Belum ada halaman favorit.</p></nav>
  </aside>
</div>
<div id="lb" role="dialog" aria-modal="true" aria-label="Tampilan gambar layar penuh">
  <div id="lbbar"><button id="lbclose" class="lb-action" type="button" aria-label="Tutup layar penuh">${ICONS.close}</button><span id="lbcount"></span><div class="lb-actions"><button id="lbwa" class="lb-action" type="button" aria-label="Bagikan via WhatsApp">${ICONS.whatsapp}</button><button id="lbfav" class="lb-action" type="button" aria-label="Tandai favorit">${ICONS.heart}</button></div></div>
  <div id="lbstage"><div id="lbwrap"><img id="lbimg" alt="" draggable="false" /></div><button id="lbprev" class="lb-arrow" type="button" aria-label="Gambar sebelumnya">${ICONS.left}</button><button id="lbnext" class="lb-arrow" type="button" aria-label="Gambar berikutnya">${ICONS.right}</button></div>
  <p id="lbhint">Ketuk dua kali untuk memperbesar · geser untuk pindah halaman</p>
</div>
<script>
(function(){
  var PAGES=${data}, KEY='inyong-fav-v1', TTL=3600000, cur=0, onlyFavs=false;
  var shell=document.getElementById('sidebar-shell'), lb=document.getElementById('lb'), lbimg=document.getElementById('lbimg'), lbwrap=document.getElementById('lbwrap'), lbstage=document.getElementById('lbstage'), lbcount=document.getElementById('lbcount'), lbfav=document.getElementById('lbfav'), toTop=document.getElementById('to-top');
  function readFav(){try{var raw=JSON.parse(localStorage.getItem(KEY)||'{}')||{}, fresh={}, now=Date.now();for(var k in raw)if(now-raw[k]<TTL)fresh[k]=raw[k];return fresh}catch(e){return {}}}
  function writeFav(value){try{localStorage.setItem(KEY,JSON.stringify(value))}catch(e){}}
  var fav=readFav();
  function paint(){
    var count=0;
    document.querySelectorAll('[data-fav]').forEach(function(b){var on=!!fav[b.dataset.fav];b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));if(on)count++});
    document.querySelectorAll('.nav-item').forEach(function(b){var on=!!fav[b.dataset.go];b.classList.toggle('is-fav',on);b.classList.toggle('hidden',onlyFavs&&!on)});
    document.getElementById('fav-count').textContent=String(count);document.getElementById('empty-favs').style.display=onlyFavs&&count===0?'block':'none';
    var p=PAGES[cur];if(p){var on=!!fav[p.id];lbfav.classList.toggle('on',on);lbfav.setAttribute('aria-pressed',String(on));}
  }
  function toggle(id){fav=readFav();if(fav[id])delete fav[id];else fav[id]=Date.now();writeFav(fav);paint()}
  document.querySelectorAll('[data-fav]').forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();toggle(b.dataset.fav)})});
  setInterval(function(){fav=readFav();paint()},60000);paint();
  function openSide(){shell.classList.add('open');shell.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
  function closeSide(){shell.classList.remove('open');shell.setAttribute('aria-hidden','true');document.body.style.overflow=''}
  document.getElementById('menu-open').addEventListener('click',openSide);document.getElementById('menu-close').addEventListener('click',closeSide);document.getElementById('scrim').addEventListener('click',closeSide);
  document.getElementById('only-favs').addEventListener('click',function(){onlyFavs=!onlyFavs;this.classList.toggle('on',onlyFavs);paint()});
  document.querySelectorAll('[data-go]').forEach(function(b){b.addEventListener('click',function(){closeSide();var el=document.getElementById(b.dataset.go);if(el)el.scrollIntoView({behavior:'smooth',block:'start'})})});
  document.getElementById('save-html').addEventListener('click',function(){var blob=new Blob(['<!doctype html>\\n'+document.documentElement.outerHTML],{type:'text/html;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='menu-kantin-inyong.html';a.click();URL.revokeObjectURL(url)});
  function scrollState(){toTop.classList.toggle('show',window.scrollY>window.innerHeight)}window.addEventListener('scroll',scrollState,{passive:true});toTop.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'})});scrollState();
  var figs=document.querySelectorAll('figure');if('IntersectionObserver'in window){var io=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'120px'});figs.forEach(function(el){io.observe(el)})}else figs.forEach(function(el){el.classList.add('in')});
  var t={s:1,x:0,y:0},drag=0,anim=true,pts={},n=0,g=null,lastTap=0,pushed=false;
  function apply(){lbwrap.style.transition=anim?'transform .28s cubic-bezier(.22,.61,.36,1)':'none';lbwrap.style.transform='translate3d('+(t.x+drag)+'px,'+t.y+'px,0) scale('+t.s+')'}
  function show(i){if(i<0||i>=PAGES.length)return;cur=i;t={s:1,x:0,y:0};drag=0;anim=true;lbimg.src=PAGES[i].url;lbimg.alt=PAGES[i].alt;lbimg.style.animation='none';void lbimg.offsetWidth;lbimg.style.animation='pop .3s cubic-bezier(.22,.61,.36,1)';lbcount.textContent=(i+1)+' / '+PAGES.length;document.getElementById('lbprev').style.visibility=i?'visible':'hidden';document.getElementById('lbnext').style.visibility=i<PAGES.length-1?'visible':'hidden';apply();paint()}
  function openLb(i){lb.classList.add('open');document.body.style.overflow='hidden';show(i);try{history.pushState({lightbox:true},'');pushed=true}catch(e){}}
  function closeLb(fromPop){lb.classList.remove('open');document.body.style.overflow='';if(pushed&&!fromPop){pushed=false;history.back()}}
  window.addEventListener('popstate',function(){if(lb.classList.contains('open')){pushed=false;closeLb(true)}});
  document.querySelectorAll('[data-open]').forEach(function(b){b.addEventListener('click',function(){openLb(+b.dataset.open)})});document.getElementById('lbclose').addEventListener('click',function(){closeLb(false)});lbfav.addEventListener('click',function(){toggle(PAGES[cur].id)});document.getElementById('lbprev').addEventListener('click',function(){show(cur-1)});document.getElementById('lbnext').addEventListener('click',function(){show(cur+1)});
  function share(i){var p=PAGES[i];function wa(){window.open('https://wa.me/?text='+encodeURIComponent(p.alt+'\\n'+p.url),'_blank','noopener')}if(navigator.share&&navigator.canShare){fetch(p.url).then(function(r){return r.blob()}).then(function(b){var f=new File([b],p.id+'.webp',{type:b.type||'image/webp'});if(navigator.canShare({files:[f]}))return navigator.share({files:[f],title:p.title,text:p.alt});wa()}).catch(function(e){if(!e||e.name!=='AbortError')wa()})}else wa()}
  document.querySelectorAll('[data-share]').forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();share(+b.dataset.share)})});document.getElementById('lbwa').addEventListener('click',function(){share(cur)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){if(lb.classList.contains('open'))closeLb(false);else closeSide()}if(!lb.classList.contains('open'))return;if(e.key==='ArrowRight')show(cur+1);if(e.key==='ArrowLeft')show(cur-1)});
  function points(){var a=[];for(var k in pts)a.push(pts[k]);return a}
  lbstage.addEventListener('pointerdown',function(e){lbstage.setPointerCapture&&lbstage.setPointerCapture(e.pointerId);pts[e.pointerId]={x:e.clientX,y:e.clientY};n++;anim=false;var r=lbstage.getBoundingClientRect(),a=points();if(n===2)g={d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)||1,s:t.s,x:t.x,y:t.y,mx:(a[0].x+a[1].x)/2,my:(a[0].y+a[1].y)/2,ox:(a[0].x+a[1].x)/2-r.left,oy:(a[0].y+a[1].y)/2-r.top};else if(n===1)g={d:0,s:t.s,x:t.x,y:t.y,mx:e.clientX,my:e.clientY,ox:0,oy:0}});
  lbstage.addEventListener('pointermove',function(e){if(!pts[e.pointerId]||!g)return;pts[e.pointerId]={x:e.clientX,y:e.clientY};var a=points();if(n>=2&&g.d){var d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)||1,k=Math.min(4,Math.max(1,(d/g.d)*g.s))/g.s;t={s:g.s*k,x:g.ox-(g.ox-g.x)*k,y:g.oy-(g.oy-g.y)*k};apply();return}var dx=e.clientX-g.mx,dy=e.clientY-g.my;if(t.s>1.01){t={s:g.s,x:g.x+dx,y:g.y+dy};apply()}else if(Math.abs(dx)>Math.abs(dy)){drag=dx;apply()}});
  function end(e){delete pts[e.pointerId];n=Math.max(0,n-1);if(n>0)return;g=null;anim=true;var moved=Math.abs(drag)>8;if(t.s<=1.01){if(drag<-60&&cur<PAGES.length-1){drag=0;show(cur+1);return}if(drag>60&&cur>0){drag=0;show(cur-1);return}drag=0}apply();if(moved)return;var now=Date.now();if(now-lastTap<300){lastTap=0;var r=lbstage.getBoundingClientRect(),px=e.clientX-r.left,py=e.clientY-r.top;if(t.s>1.01)t={s:1,x:0,y:0};else{var k=2.5;t={s:k,x:px-(px-t.x)*k,y:py-(py-t.y)*k}}apply()}else lastTap=now}
  lbstage.addEventListener('pointerup',end);lbstage.addEventListener('pointercancel',end);
  var pre={};function idle(fn){(window.requestIdleCallback||function(f){setTimeout(f,200)})(fn,{timeout:1200})}function chain(list){var q=list.slice();(function step(){var u=q.shift();if(!u)return;var im=new Image();im.decoding='async';im.fetchPriority='low';im.onload=im.onerror=function(){idle(step)};pre[u]=1;im.src=u})()}window.addEventListener('load',function(){idle(function(){chain(PAGES.slice(1).map(function(p){return p.url}))})});
})();
</script>
</body>
</html>`;
}

export function downloadMenuHtml(pages: MenuPage[]) {
  const blob = new Blob([buildMenuHtml(pages)], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "menu-kantin-inyong.html";
  a.click();
  URL.revokeObjectURL(url);
}
