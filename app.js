(function(){
  var stage = document.getElementById('stage');
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var cur = 0;

  // rulers
  document.querySelectorAll('.ruler').forEach(function(r){
    var n = +r.dataset.n, sub = +r.dataset.sub, h = +(r.dataset.h || 100);
    var y = r.dataset.y ? r.dataset.y.split('-').map(Number) : null;
    if (!r.style.height) r.style.height = h + 'px';
    if (y){ var b = document.createElement('span'); b.className = 'yel'; b.style.left = (y[0]/n*100)+'%'; b.style.width = ((y[1]-y[0])/n*100)+'%'; r.appendChild(b); }
    for (var i = 0; i <= n*sub; i++){
      var major = i % sub === 0, half = !major && sub % 2 === 0 && i % (sub/2) === 0;
      var t = document.createElement('i');
      t.style.width = (major ? 3 : 2) + 'px';
      t.style.height = Math.round(h * (major ? 1 : half ? .55 : .28)) + 'px';
      t.style.setProperty('--i', i);
      var pos = i/sub; if (y && pos >= y[0] && pos <= y[1]) t.className = 'on';
      r.appendChild(t);
    }
  });
  document.querySelectorAll('.labels[data-labels]').forEach(function(l){
    var p = l.dataset.labels.split('-').map(Number);
    for (var i = p[0]; i <= p[1]; i++){ var s = document.createElement('span'); s.textContent = i % p[2] === 0 ? String(i).padStart(2,'0') : ''; l.appendChild(s); }
  });


  // takt strips: "/" strokes with a 2 every few beats, ending in 22
  document.querySelectorAll('.takt').forEach(function(el){
    var n = +(el.dataset.n || 30), every = +(el.dataset.every || 9), h = +(el.dataset.h || 60);
    el.style.setProperty('--h', h + 'px');
    el.style.setProperty('--amp', (+(el.dataset.amp) || h * 0.09) + 'px');
    for (var i = 0; i < n; i++){
      var two = (i % every === 2) || i >= n - 2;
      var b = document.createElement('span');
      b.className = 'b';
      b.style.setProperty('--i', i);
      b.setAttribute('aria-hidden', 'true');
      var e = document.createElement('span');
      e.className = two ? 'tw' : 'st';
      if (two) e.textContent = '2';
      e.style.setProperty('--i', i);
      b.appendChild(e);
      el.appendChild(b);
    }
  });

  // ruler made of twos
  var twos = document.getElementById('twos');
  if (twos) for (var i = 0; i <= 22; i++){
    var s = document.createElement('span');
    var big = i % 5 === 0 && i < 22;
    s.textContent = i === 22 ? '22' : '2';
    s.className = 'rise';
    s.style.fontSize = (i === 22 ? 190 : big ? 190 : 72) + 'px';
    s.style.setProperty('--d', (0.15 + i*0.045) + 's');
    if (i === 22) s.style.color = 'var(--yel)';
    twos.appendChild(s);
  }

  // data-d → --d for rise elements
  document.querySelectorAll('[data-d]').forEach(function(el){ el.style.setProperty('--d', el.dataset.d + 's'); });

  // progress ruler
  var prog = document.getElementById('progress');
  slides.forEach(function(s, i){
    var a = document.createElement('a'); a.href = '#' + (i+1);
    a.setAttribute('aria-label', 'Slide ' + (i+1) + ': ' + s.getAttribute('aria-label'));
    a.addEventListener('click', function(e){ e.preventDefault(); go(i); });
    prog.appendChild(a);
  });

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function countUp(el){
    var to = +el.dataset.count; if (reduce){ el.textContent = to; return; }
    var t0 = null;
    function step(t){ if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 900); el.textContent = Math.round(to * p); if (p < 1) requestAnimationFrame(step); }
    el.textContent = '0'; requestAnimationFrame(step);
  }

  function go(i){
    i = Math.max(0, Math.min(slides.length - 1, i));
    slides[cur].classList.remove('is-active');
    var old = slides[cur];
    var tape = old.querySelector('#tape'); if (tape) tape.style.height = '0';
    var mt = old.querySelector('#mtape'); if (mt) mt.style.width = '0';
    cur = i;
    var s = slides[cur];
    void s.offsetWidth;
    s.classList.add('is-active');
    s.querySelectorAll('[data-count]').forEach(countUp);
    var tp = s.querySelector('#tape'); if (tp) requestAnimationFrame(function(){ tp.style.height = '440px'; });
    var m = s.querySelector('#mtape'); if (m) requestAnimationFrame(function(){ m.style.width = '190px'; });
    Array.prototype.forEach.call(prog.children, function(a, k){ a.classList.toggle('cur', k === cur); if (k === cur) a.setAttribute('aria-current','step'); else a.removeAttribute('aria-current'); });
    try { history.replaceState(null, '', '#' + (cur+1)); } catch(e){}
  }

  function fit(){
    var vw = window.innerWidth, vh = window.innerHeight - 70;
    var k = Math.min(vw / 1920, vh / 1080);
    stage.style.transform = 'translate(-50%, calc(-50% - 28px)) scale(' + k + ')';
  }
  window.addEventListener('resize', fit); fit();

  document.getElementById('prev').addEventListener('click', function(){ go(cur - 1); });
  document.getElementById('next').addEventListener('click', function(){ go(cur + 1); });
  document.addEventListener('keydown', function(e){
    if (e.target.closest && e.target.closest('button, a')) { if (e.key === 'Enter' || e.key === ' ') return; }
    if (['ArrowRight','PageDown',' '].indexOf(e.key) > -1){ e.preventDefault(); go(cur + 1); }
    else if (['ArrowLeft','PageUp'].indexOf(e.key) > -1){ e.preventDefault(); go(cur - 1); }
    else if (e.key === 'Home'){ go(0); } else if (e.key === 'End'){ go(slides.length - 1); }
  });
  var sx = null;
  document.addEventListener('touchstart', function(e){ sx = e.touches[0].clientX; }, {passive:true});
  document.addEventListener('touchend', function(e){ if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1)); sx = null; });

  var start = parseInt((location.hash || '').slice(1), 10);
  slides[0].classList.add('is-active');
  go(isNaN(start) ? 0 : start - 1);
})();
