/* SiNiKukiss - script.js */
const WA_NUMBER = '6285815787878';
const HARGA = 20000;

const PRODUCTS = [
  { id:'original',   tag:'Original',    nama:'Golden Hour',       img:'images/original.jpg',   mood:'santai',
    desc:'Kulit keemasan yang retak cantik, ditaburi garam laut. Manis, gurih, dan bikin susah berhenti di gigitan pertama.' },
  { id:'matcha',     tag:'Matcha',      nama:'Hijau Bikin Nagih', img:'images/matcha.jpg',     mood:'tenang',
    desc:'Matcha pekat bertemu white chocochips yang lumer. Pahit teh hijaunya pas, manisnya tidak berlebihan.' },
  { id:'coffee',     tag:'Coffee',      nama:'Kopi Senja',        img:'images/coffee.jpg',     mood:'semangat',
    desc:'Adonan cokelat gelap beraroma kopi, dihiasi biji kopi dan siraman karamel. Teman paling pas untuk sore hari.' },
  { id:'red-velvet', tag:'Red Velvet',  nama:'Merah Merona',      img:'images/red-velvet.jpg', mood:'romantis',
    desc:'Merah pekat dengan white chocochips dan guyuran cokelat putih di atasnya. Cantik dipandang, enak dimakan.' },
  { id:'oreo',       tag:'Cookies n Cream', nama:'Gelap Terang',  img:'images/oreo.jpg',       mood:'gembira',
    desc:'Adonan krim penuh remah biskuit cokelat, dimahkotai sepotong biskuit isi krim. Renyah dan creamy sekaligus.' },
  { id:'strawberry', tag:'Strawberry',  nama:'Pink Promise',      img:'images/strawberry.jpg', mood:'manis',
    desc:'Warna pink manis dengan potongan stroberi kering, white chocochips, dan drizzle pink. Segar dan ceria.' }
];

const MOODS = [
  { k:'santai',   label:'Santai',        pesan:'Yang klasik selalu menang.' },
  { k:'tenang',   label:'Butuh tenang',  pesan:'Sedikit pahit, banyak damai.' },
  { k:'semangat', label:'Butuh semangat',pesan:'Kopi dalam bentuk kukis.' },
  { k:'romantis', label:'Lagi romantis', pesan:'Merah, manis, dan penuh perasaan.' },
  { k:'gembira',  label:'Lagi gembira',  pesan:'Rayakan dengan remah biskuit.' },
  { k:'manis',    label:'Pengin yang manis', pesan:'Pink dan ceria, langsung naik mood.' }
];

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const rp = n => 'Rp' + n.toLocaleString('id-ID');
const $ = id => document.getElementById(id);
const rand = (a,b) => a + Math.random()*(b-a);

/* ---------- Keranjang ---------- */
let cart = {};
try { cart = JSON.parse(localStorage.getItem('sinikukiss-cart') || '{}'); } catch(e) { cart = {}; }

function save(){ try { localStorage.setItem('sinikukiss-cart', JSON.stringify(cart)); } catch(e){} }

function ubahJumlah(id, d){
  cart[id] = Math.max(0, (cart[id]||0) + d);
  if (!cart[id]) delete cart[id];
  save(); refresh();
}

function refresh(){
  let n = 0, lines = [];
  const list = $('items'); list.innerHTML = '';
  for (const p of PRODUCTS){
    const q = cart[p.id] || 0;
    $('q-'+p.id).textContent = q;
    n += q;
    if (!q) continue;
    lines.push(`- ${p.nama} (${p.tag}) x${q} = ${rp(q*HARGA)}`);
    const row = document.createElement('div');
    row.className = 'item';
    row.innerHTML = `<img src="${p.img}" alt=""><div>${p.nama}<small>${q} x ${rp(HARGA)}</small></div><div>${rp(q*HARGA)} <button data-rm="${p.id}">Hapus</button></div>`;
    list.appendChild(row);
  }
  if (!n) list.innerHTML = '<p class="empty">Keranjang masih kosong. Yuk pilih kukis dulu.</p>';
  $('count').textContent = n;
  $('total').textContent = rp(n*HARGA);
  const nama = $('name').value.trim() || '-';
  const alamat = $('address').value.trim() || '-';
  const cat = $('note').value.trim();
  const teks = `Halo SiNiKukiss, saya mau pesan:\n${lines.join('\n') || '-'}\n\nTotal: ${rp(n*HARGA)}\nNama: ${nama}\nAlamat: ${alamat}` + (cat ? `\nCatatan: ${cat}` : '');
  const wa = $('wa');
  wa.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(teks)}`;
  wa.classList.toggle('off', n === 0);
}

/* ---------- Render produk ---------- */
const grid = $('products');
PRODUCTS.forEach((p,i) => {
  const c = document.createElement('article');
  c.className = 'card';
  c.style.transitionDelay = (i*70)+'ms';
  c.innerHTML = `
    <button class="photo" data-crumb="${p.id}" aria-label="Pencet kukis ${p.nama}">
      <img src="${p.img}" alt="Cookies ${p.tag}: ${p.nama}" loading="lazy">
      <span class="tag">${p.tag}</span>
    </button>
    <div class="body">
      <h3>${p.nama}</h3>
      <p class="desc">${p.desc}</p>
      <div class="foot">
        <span class="price">${rp(HARGA)}</span>
        <div class="qty">
          <button data-id="${p.id}" data-d="-1" aria-label="Kurangi ${p.nama}">&minus;</button>
          <span id="q-${p.id}">0</span>
          <button class="plus" data-id="${p.id}" data-d="1" aria-label="Tambah ${p.nama}">+</button>
        </div>
      </div>
    </div>`;
  grid.appendChild(c);
});

/* Muncul saat di-scroll */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ e.target.classList.add('show'); io.unobserve(e.target); } }), {threshold:.15});
document.querySelectorAll('.card').forEach(c => io.observe(c));

/* ---------- Efek: remah + konfeti ---------- */
const fx = $('fx'), fctx = fx.getContext('2d');
let parts = [], fxRun = false;
function fxResize(){ fx.width = innerWidth; fx.height = innerHeight; }
addEventListener('resize', fxResize); fxResize();

function burst(x, y, n, warna){
  if (reduce) return;
  for (let i=0;i<n;i++){
    const a = rand(0, Math.PI*2), s = rand(2,7);
    parts.push({x, y, vx:Math.cos(a)*s, vy:Math.sin(a)*s-3, life:1, r:rand(2.5,6), c:warna[Math.floor(Math.random()*warna.length)], g:.22});
  }
  if (!fxRun){ fxRun = true; requestAnimationFrame(fxLoop); }
}
function fxLoop(){
  fctx.clearRect(0,0,fx.width,fx.height);
  parts = parts.filter(p => p.life > 0);
  for (const p of parts){
    p.vy += p.g; p.x += p.vx; p.y += p.vy; p.vx *= .985; p.life -= .014;
    fctx.globalAlpha = Math.max(p.life,0);
    fctx.fillStyle = p.c;
    fctx.beginPath(); fctx.arc(p.x, p.y, p.r, 0, Math.PI*2); fctx.fill();
  }
  fctx.globalAlpha = 1;
  if (parts.length) requestAnimationFrame(fxLoop); else fxRun = false;
}
const REMAH = ['#E9B872','#C98B4B','#6B4430','#F3D9A8'];
const KONFETI = ['#C2410C','#F59E0B','#1F7A4D','#F472B6','#60A5FA','#A78BFA'];

/* ---------- Toast ---------- */
let tt;
function toast(t){
  const el = $('toast'); el.textContent = t; el.classList.add('show');
  clearTimeout(tt); tt = setTimeout(() => el.classList.remove('show'), 1800);
}

/* ---------- Kukis terbang ke keranjang ---------- */
function terbang(imgEl, src){
  const tujuan = $('openCart').getBoundingClientRect();
  const dari = imgEl.getBoundingClientRect();
  if (reduce){ return; }
  const f = document.createElement('img');
  f.className = 'flyer'; f.src = src; f.alt = '';
  f.style.left = (dari.left + dari.width/2 - 32)+'px';
  f.style.top  = (dari.top + dari.height/2 - 32)+'px';
  document.body.appendChild(f);
  const dx = tujuan.left + tujuan.width/2 - (dari.left + dari.width/2);
  const dy = tujuan.top + tujuan.height/2 - (dari.top + dari.height/2);
  f.animate([
    { transform:'translate(0,0) scale(1) rotate(0)', opacity:1 },
    { transform:`translate(${dx*.5}px,${dy*.5-80}px) scale(.8) rotate(180deg)`, opacity:1, offset:.5 },
    { transform:`translate(${dx}px,${dy}px) scale(.2) rotate(360deg)`, opacity:.4 }
  ], { duration:750, easing:'cubic-bezier(.5,0,.7,.4)' }).onfinish = () => {
    f.remove();
    const b = $('openCart'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
  };
}

/* ---------- Event produk ---------- */
grid.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  if (btn.dataset.crumb){
    const r = btn.getBoundingClientRect();
    burst(e.clientX || r.left+r.width/2, e.clientY || r.top+r.height/2, 22, REMAH);
    const img = btn.querySelector('img');
    if (!reduce) img.animate([{transform:'scale(1)'},{transform:'scale(.9) rotate(-4deg)'},{transform:'scale(1.06) rotate(3deg)'},{transform:'scale(1)'}], {duration:420});
    return;
  }
  const d = Number(btn.dataset.d), id = btn.dataset.id;
  if (!id) return;
  const p = PRODUCTS.find(x => x.id === id);
  if (d > 0){
    terbang(btn.closest('.card').querySelector('img'), p.img);
    toast(`${p.nama} masuk keranjang`);
  }
  ubahJumlah(id, d);
});

$('items').addEventListener('click', e => {
  const b = e.target.closest('button[data-rm]');
  if (b){ delete cart[b.dataset.rm]; save(); refresh(); }
});
['name','address','note'].forEach(i => $(i).addEventListener('input', refresh));

/* Panel keranjang */
const ov = $('overlay');
const buka = () => ov.classList.add('open');
const tutup = () => ov.classList.remove('open');
$('openCart').onclick = buka;
$('closeCart').onclick = tutup;
ov.addEventListener('click', e => { if (e.target === ov) tutup(); });
addEventListener('keydown', e => { if (e.key === 'Escape') tutup(); });
$('wa').addEventListener('click', () => {
  const r = $('wa').getBoundingClientRect();
  burst(r.left + r.width/2, r.top, 60, KONFETI);
});

/* ---------- Mood picker ---------- */
const moodWrap = $('moods');
MOODS.forEach(m => {
  const b = document.createElement('button');
  b.className = 'mood'; b.textContent = m.label; b.setAttribute('aria-pressed','false'); b.dataset.k = m.k;
  moodWrap.appendChild(b);
});
moodWrap.addEventListener('click', e => {
  const b = e.target.closest('.mood'); if (!b) return;
  moodWrap.querySelectorAll('.mood').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  const m = MOODS.find(x => x.k === b.dataset.k);
  const p = PRODUCTS.find(x => x.mood === m.k);
  const res = $('moodResult');
  res.innerHTML = `<img src="${p.img}" alt="${p.nama}"><div><strong>${p.nama}</strong>${m.pesan}<br><button data-add="${p.id}">Tambah ke keranjang</button></div>`;
  const r = b.getBoundingClientRect();
  burst(r.left + r.width/2, r.top + r.height/2, 16, KONFETI);
});
$('moodResult').addEventListener('click', e => {
  const b = e.target.closest('button[data-add]'); if (!b) return;
  const p = PRODUCTS.find(x => x.id === b.dataset.add);
  terbang($('moodResult').querySelector('img'), p.img);
  toast(`${p.nama} masuk keranjang`);
  ubahJumlah(p.id, 1);
});

/* ---------- Playground kukis di hero ---------- */
(function(){
  const cv = $('playground'), ctx = cv.getContext('2d');
  const hero = cv.parentElement;
  let W = 0, H = 0, dpr = 1;
  const mouse = { x:-999, y:-999 };
  const imgs = PRODUCTS.map(p => { const i = new Image(); i.src = p.img; return i; });
  const cookies = [];

  function resize(){
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = hero.clientWidth; H = hero.clientHeight;
    cv.width = W*dpr; cv.height = H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  addEventListener('resize', resize); resize();

  const jumlah = innerWidth < 640 ? 6 : 9;
  for (let i=0;i<jumlah;i++){
    const r = rand(innerWidth < 640 ? 30 : 38, innerWidth < 640 ? 46 : 62);
    cookies.push({ x:rand(r, Math.max(r+1, W-r)), y:rand(r, Math.max(r+1, H-r)), r,
      vx:rand(-1,1), vy:rand(-1,1), rot:rand(0,6.28), vr:rand(-.012,.012),
      img: imgs[i % imgs.length], sq:0, sqv:0, ph:rand(0,6.28) });
  }

  function pos(e){ const b = cv.getBoundingClientRect(); return { x:e.clientX-b.left, y:e.clientY-b.top }; }
  hero.addEventListener('pointermove', e => { const p = pos(e); mouse.x = p.x; mouse.y = p.y; });
  hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });
  hero.addEventListener('pointerdown', e => {
    if (e.target.closest('a')) return;
    const p = pos(e); mouse.x = p.x; mouse.y = p.y;
    for (let i=cookies.length-1;i>=0;i--){
      const c = cookies[i];
      if (Math.hypot(p.x-c.x, p.y-c.y) < c.r){
        c.sqv = .25; c.vy -= 5; c.vx += rand(-3,3); c.vr = rand(-.1,.1);
        burst(e.clientX, e.clientY, 20, REMAH);
        break;
      }
    }
  });

  function loop(t){
    ctx.clearRect(0,0,W,H);
    for (const c of cookies){
      c.sqv += -c.sq*.2; c.sqv *= .85; c.sq += c.sqv;
      c.vr *= .995;
      const dx = c.x-mouse.x, dy = c.y-mouse.y, d = Math.hypot(dx,dy) || 1;
      if (d < c.r+110){ const f = (c.r+110-d)/(c.r+110)*.35; c.vx += dx/d*f; c.vy += dy/d*f; }
      c.vx += rand(-.03,.03); c.vy += rand(-.03,.03);
      const sp = Math.hypot(c.vx,c.vy), mx = 2.6, mn = .5;
      if (sp > mx){ c.vx *= mx/sp; c.vy *= mx/sp; }
      else if (sp < mn){ const k = mn/(sp||.01); c.vx = (c.vx||.3)*k; c.vy = (c.vy||.3)*k; }
      if (!reduce){ c.x += c.vx; c.y += c.vy; c.rot += c.vr + .004; }
      if (c.x < c.r){ c.x = c.r; c.vx = Math.abs(c.vx); }
      if (c.x > W-c.r){ c.x = W-c.r; c.vx = -Math.abs(c.vx); }
      if (c.y < c.r){ c.y = c.r; c.vy = Math.abs(c.vy); }
      if (c.y > H-c.r){ c.y = H-c.r; c.vy = -Math.abs(c.vy); }
    }
    for (let i=0;i<cookies.length;i++) for (let j=i+1;j<cookies.length;j++){
      const a = cookies[i], b = cookies[j];
      const dx = b.x-a.x, dy = b.y-a.y, d = Math.hypot(dx,dy) || .01, m = a.r+b.r;
      if (d < m){
        const o = (m-d)/2, nx = dx/d, ny = dy/d;
        a.x -= nx*o; a.y -= ny*o; b.x += nx*o; b.y += ny*o;
        const va = a.vx*nx + a.vy*ny, vb = b.vx*nx + b.vy*ny;
        a.vx += (vb-va)*nx; a.vy += (vb-va)*ny; b.vx += (va-vb)*nx; b.vy += (va-vb)*ny;
      }
    }
    for (const c of cookies){
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot + Math.sin(t*.002 + c.ph)*.05);
      ctx.scale(1+c.sq, 1-c.sq);
      ctx.shadowColor = 'rgba(80,40,10,.25)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6;
      ctx.beginPath(); ctx.arc(0,0,c.r,0,Math.PI*2); ctx.fillStyle = '#E9B872'; ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.clip();
      if (c.img.complete && c.img.naturalWidth){
        const s = c.img.naturalWidth, off = s*.12;
        ctx.drawImage(c.img, off, off, s-off*2, s-off*2, -c.r, -c.r, c.r*2, c.r*2);
      }
      ctx.restore();
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

/* Jejak remah kecil saat kursor digerakkan di halaman */
let lastTrail = 0;
addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse') return;
  const now = performance.now();
  if (now - lastTrail < 90) return;
  lastTrail = now;
  burst(e.clientX, e.clientY, 1, REMAH);
});

refresh();
