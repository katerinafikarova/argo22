/* =========================================================
   ARGO22 · BRAND 2.0 · ENGINE
   Nastavení přehrávání měňte v CONFIG. Obsah slidů je v index.html.
   ========================================================= */
const CONFIG = {
  showCursor: true,        // simulovaný kurzor, který „kliká“ ve webu na slidu 11
  webClicksStats: true,    // na slidu s webem kurzor sám klikne na čísla, aby se nalila
  hideMouseAfter: 1800     // v celé obrazovce schovat šipku myši po tolika ms bez pohybu
};

(function () {
  const stage = document.getElementById('stage');
  const slides = Array.from(stage.querySelectorAll('.slide'));
  const cursor = document.getElementById('cursor');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cur = -1, slideTimers = [];

  /* ---------- logo: jeden zdroj, kopíruje se do [data-logo] ---------- */
  const logoTpl = document.getElementById('logo-svg');
  document.querySelectorAll('[data-logo]').forEach(el => { el.classList.add('logo'); el.innerHTML = logoTpl.innerHTML; });

  /* ---------- páska: vždy kopie assets/paska.svg z <template id="tape-svg"> ---------- */
  const tapeTpl = document.getElementById('tape-svg');
  function buildTape(el, crop) {
    const svg = tapeTpl.content.firstElementChild.cloneNode(true);
    const c = (crop || el.dataset.crop || '').trim().split(/\s+/).map(Number);
    if (c.length === 2 && !isNaN(c[0])) svg.setAttribute('viewBox', `${c[0]} 0 ${c[1]} 72.8`);
    el.innerHTML = ''; el.appendChild(svg); el.setAttribute('aria-hidden', 'true');
  }
  document.querySelectorAll('.tape').forEach(t => { if (!t.closest('.bar')) buildTape(t); });
  /* pruh .bar: <div class="bar" style="--to:60%"></div>, volitelně data-crop="x šířka" */
  document.querySelectorAll('.bar').forEach(bar => {
    const crop = bar.dataset.crop || '';
    bar.innerHTML = '<div class="tape"></div><div class="fill"><div class="tape ink"></div></div>';
    bar.querySelectorAll('.tape').forEach(t => buildTape(t, crop));
  });

  /* ---------- číslo slidu: hlavička vpravo, jinak štítek vpravo dole ---------- */
  slides.forEach((s, i) => {
    const n = String(i + 1).padStart(2, '0'), slot = s.querySelector('[data-num]');
    if (slot) slot.textContent = n;
    else { const p = document.createElement('span'); p.className = 'pageno'; p.textContent = n; s.appendChild(p); }
  });

  /* ---------- škálování jeviště ---------- */
  function fit() {
    const k = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.transform = `translate(-50%,-50%) scale(${k})`;
  }
  window.addEventListener('resize', fit); fit();

  /* ---------- pomocníci pro časování v rámci slidu ---------- */
  function later(fn, ms) { const t = setTimeout(fn, ms); slideTimers.push(t); return t; }
  function every(fn, ms) { const t = setInterval(fn, ms); slideTimers.push(t); return t; }
  function clearSlideTimers() { slideTimers.forEach(t => { if (t && t.off) t.off(); else { clearTimeout(t); clearInterval(t); } }); slideTimers = []; }

  /* ---------- simulovaný kurzor ---------- */
  function pointTo(el, click) {
    if (!CONFIG.showCursor || !el || reduce) { if (click) click(); return; }
    const s = stage.getBoundingClientRect(), r = el.getBoundingClientRect(), k = s.width / 1920;
    const x = (r.left - s.left + r.width / 2) / k, y = (r.top - s.top + r.height / 2) / k;
    cursor.classList.add('on');
    cursor.style.transform = `translate(${x}px,${y}px)`;
    if (click) later(() => { cursor.classList.remove('click'); void cursor.offsetWidth; cursor.classList.add('click'); click(); }, 1050);
  }

  function pointToXY(x, y, click) {
    if (!CONFIG.showCursor || reduce) { if (click) click(); return; }
    cursor.classList.add('on');
    cursor.style.transform = `translate(${x}px,${y}px)`;
    if (click) later(() => { cursor.classList.remove('click'); void cursor.offsetWidth; cursor.classList.add('click'); click(); }, 1050);
  }

  /* ---------- automatické akce: data-auto="…" ---------- */
  const ACTIONS = {
    /* listování carouselem: kurzor klikne na šipku a posune */
    carousel(el) {
      const track = el.querySelector('.track'), items = track.children.length;
      const dots = el.parentElement.querySelectorAll('.dots i'), next = el.parentElement.querySelector('[data-next]');
      const ms = +(el.dataset.ms || 4000); let i = 0;
      const show = () => { track.style.transform = `translateX(${-i * 100}%)`; dots.forEach((d, k) => d.classList.toggle('on', k === i)); };
      show();
      every(() => pointTo(next || el, () => { i = (i + 1) % items; show(); }), ms);
    },
    /* psací stroj: data-lines='["…","…"]' */
    type(el) {
      const lines = JSON.parse(el.dataset.lines || '[]'); let li = 0;
      const run = () => {
        const txt = lines[li % lines.length]; let k = 0; el.textContent = '';
        const t = every(() => { k++; el.textContent = txt.slice(0, k); if (k >= txt.length) { clearInterval(t); later(() => { li++; run(); }, +(el.dataset.hold || 2600)); } }, 42);
      };
      run();
    },
    /* web v prohlížeči: běží dokola. Sjede k číslům, kurzor na ně klikne (naleje je),
       pokračuje k projektům a vrátí se nahoru. Iframe se posouvá, stránka se ovládá přes postMessage. */
    scroll(el) {
      const frame = el.querySelector('iframe'), k = +(el.dataset.scale || .6), max = +(el.dataset.max || 1600);
      const send = m => { try { frame.contentWindow.postMessage(Object.assign({ argo22: '' }, m), '*'); } catch (e) {} };
      const move = (y, s) => { frame.style.transition = s ? `transform ${s}s cubic-bezier(.45,.05,.25,1)` : 'none'; frame.style.transform = `scale(${k}) translateY(${-y}px)`; };
      move(0, 0);
      let info = null;
      const onMsg = e => { if (e.data && e.data.argo22 === 'rects') info = e.data; };
      window.addEventListener('message', onMsg);
      slideTimers.push({ off: () => window.removeEventListener('message', onMsg) });
      const stageXY = (px, py, y) => {
        const s = stage.getBoundingClientRect(), r = el.getBoundingClientRect(), ks = s.width / 1920;
        return [(r.left - s.left) / ks + px * k, (r.top - s.top) / ks + (py - y) * k];
      };
      const cycle = () => {
        send({ argo22: 'reset' }); move(0, 0); cursor.classList.remove('on');
        send({ argo22: 'rects' });
        later(() => {
          if (!CONFIG.webClicksStats || !info || !info.tiles || !info.tiles.length) {   // záloha: jen roluje
            move(max, 7); later(() => move(0, 7), 8000); later(cycle, 16500); return;
          }
          const y = Math.max(0, info.statsTop - 90);
          move(y, 3.2);
          info.tiles.forEach((t, i) => later(() => {
            const [x, yy] = stageXY(t.x + t.w * .5, t.y + t.h * .45, y);
            pointToXY(x, yy, () => send({ argo22: 'fill', i }));
          }, 3600 + i * 1500));
          const after = 3600 + info.tiles.length * 1500 + 1800;
          const py = Math.min(max, Math.max(0, (info.projTop || max) - 60)), items = info.projects || [];
          later(() => move(py, 4), after);
          items.forEach((p, i) => later(() => {
            const [x, yy] = stageXY(p.x + p.w * .45, p.y + p.h * .5, py);
            pointToXY(x, yy, () => send({ argo22: 'project', i }));
          }, after + 4600 + i * 3200));
          const end = after + 4600 + items.length * 3200 + 600;
          later(() => { send({ argo22: 'project-leave' }); cursor.classList.remove('on'); move(0, 4.5); }, end);
          later(cycle, end + 6000);
        }, 1200);
      };
      cycle();
    },
    /* počítadlo čísel: data-count="15" */
    count(el) {
      const to = +el.dataset.count, dec = (el.dataset.count.split(',')[1] || '').length;
      const run = () => { const t0 = performance.now(); const f = t => { const p = Math.min(1, (t - t0) / 1400); el.textContent = (to * p).toFixed(dec).replace('.', ','); if (p < 1 && el.isConnected) requestAnimationFrame(f); }; requestAnimationFrame(f); };
      run();
    },
    /* nástroj na copy: napíše fakt, pak ukáže návrhy, dokola */
    tool(el) {
      const input = el.querySelector('[data-input]'), outs = el.querySelectorAll('[data-out]');
      const fact = input.dataset.text;
      const run = () => {
        outs.forEach(o => o.style.opacity = 0); input.textContent = ''; let k = 0;
        const t = every(() => { k++; input.textContent = fact.slice(0, k); if (k >= fact.length) { clearInterval(t); outs.forEach((o, i) => later(() => { o.style.opacity = 1; }, 500 + i * 700)); } }, 45);
      };
      run(); every(run, 12000);
    },
    /* video: pro jistotu znovu spustit při vstupu na slide */
    video(el) { try { el.currentTime = 0; el.play(); } catch (e) {} }
  };

  /* ---------- přechody mezi slidy ---------- */
  function go(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    if (i === cur) return;
    clearSlideTimers();
    if (cur >= 0) slides[cur].classList.remove('is-active');
    cur = i;
    const s = slides[cur];
    void s.offsetWidth; s.classList.add('is-active');
    cursor.classList.remove('on');
    s.querySelectorAll('[data-auto]').forEach(el => { const a = ACTIONS[el.dataset.auto]; if (a) a(el); });
    try { history.replaceState(null, '', '#' + (cur + 1)); } catch (e) {}
  }
  const next = () => go(cur + 1), prev = () => go(cur - 1);

  /* ---------- ovládání myší: 1. klik = celá obrazovka, další klik = další slide, pravé tlačítko = zpět ---------- */
  const root = document.documentElement;
  const canFull = !!(root.requestFullscreen || root.webkitRequestFullscreen);
  const isFull = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
  function enterFull() {
    try { const r = (root.requestFullscreen || root.webkitRequestFullscreen).call(root, { navigationUI: 'hide' }); if (r && r.catch) r.catch(() => {}); } catch (e) {}
  }
  /* když prohlížeč celou obrazovku odmítne, další kliky prostě listují;
     po ručním odchodu z celé obrazovky (Esc) ji první klik zase zapne */
  let askFull = canFull;
  ['fullscreenchange', 'webkitfullscreenchange'].forEach(ev => document.addEventListener(ev, () => { if (!isFull()) askFull = canFull; }));
  document.addEventListener('click', e => {
    if (e.button !== 0) return;
    if (askFull && !isFull()) { askFull = false; enterFull(); return; }
    next();
  });
  document.addEventListener('contextmenu', e => { e.preventDefault(); prev(); });
  document.addEventListener('keydown', e => {
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); prev(); }
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(slides.length - 1);
    else if (e.key === 'f' || e.key === 'F') { if (canFull && !isFull()) enterFull(); }
  });

  /* šipka myši zmizí, když se nehýbe */
  let idle = null;
  const wake = () => { document.body.classList.remove('idle'); clearTimeout(idle); idle = setTimeout(() => document.body.classList.add('idle'), CONFIG.hideMouseAfter); };
  document.addEventListener('mousemove', wake); wake();

  window.addEventListener('hashchange', () => { const n = parseInt(location.hash.slice(1), 10); if (!isNaN(n) && n - 1 !== cur) go(n - 1); });
  const start = parseInt((location.hash || '').slice(1), 10);
  const begin = () => go(isNaN(start) ? 0 : start - 1);
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(begin);
})();
