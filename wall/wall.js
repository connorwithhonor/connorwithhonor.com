/* ---------------------------------------------------------------------------
   STUDIO WALL ENGINE. Shared by /1 /2 /3 /4 on both domains.

   Each wall page sets window.WALL before loading this file:
     theme  : 'lime' | 'cyan' | 'red' | 'gold'   (motif + colors)
     brand  : the line pinned at the top
     slides : [{t:'fig'|'stack'|'rows'|'line', ...}]
     ticker : short strings for the bottom band
     live   : 'scoh' to append live market slides, otherwise omit

   Query flags:
     ?panel=N   offsets the rotation so four monitors read as one wall, never a
                mirror. Panel 2 starts on slide 2, and so on.
     ?speed=20  seconds per slide (default 16)

   FAILURE RULE: a backdrop must never show a blank or a broken value on camera.
   Every live fetch is guarded and falls back to the written slides in silence.
--------------------------------------------------------------------------- */
(function(){
  var Q     = new URLSearchParams(location.search);
  var PANEL = Math.max(1, parseInt(Q.get('panel') || '1', 10));
  var SECS  = Math.max(6, parseInt(Q.get('speed') || '16', 10));
  var W     = window.WALL || {};
  var el    = function(id){ return document.getElementById(id); };

  /* ---- motif ------------------------------------------------------------
     Four backgrounds, one per lane, so a glance at the monitor tells you which
     argument is on it. All of them are slow, thick-stroked and low-alpha for
     the same camera reasons the type is. */
  (function motif(){
    var c = el('motif'), x = c.getContext('2d'), Wd, Ht, hz, depth, t0 = performance.now();
    var ac = getComputedStyle(document.documentElement).getPropertyValue('--ac').trim() || '#fff';
    function resize(){ Wd = c.width = innerWidth; Ht = c.height = innerHeight; hz = Ht * .56; depth = Ht - hz; }
    addEventListener('resize', resize); resize();

    var kind = W.theme === 'cyan' ? 'grid' : W.theme === 'red' ? 'rings'
             : W.theme === 'lime' ? 'chev' : 'rays';

    function frame(now){
      var e = (now - t0) / 1000;                    // seconds since load
      x.clearRect(0, 0, Wd, Ht);
      x.strokeStyle = ac; x.lineWidth = 2.4;        // never hairlines

      if (kind === 'grid') {                        // AI lane: perspective horizon
        var ROWS = 15, COLS = 22, ph = (e * .09) % 1;
        for (var i = 0; i <= COLS; i++){
          x.globalAlpha = .30 - Math.abs(i / COLS - .5) * .26;
          x.beginPath(); x.moveTo(Wd / 2, hz); x.lineTo(Wd / 2 - Wd * 1.5 + (Wd * 3 * i / COLS), Ht); x.stroke();
        }
        for (var r = 1; r <= ROWS; r++){
          var f = (((r + ph - 1) % ROWS) + 1) / ROWS;
          x.globalAlpha = .10 + .42 * f;
          var y = hz + depth * Math.pow(f, 2.1);
          x.beginPath(); x.moveTo(0, y); x.lineTo(Wd, y); x.stroke();
        }
        x.globalAlpha = .8; x.lineWidth = 3;
        x.beginPath(); x.moveTo(0, hz); x.lineTo(Wd, hz); x.stroke();

      } else if (kind === 'rings') {                // market lane: a slow pulse
        var R = Math.hypot(Wd, Ht) * .62, N = 7, cy = Ht * .5;
        x.lineWidth = 3;
        for (var k = 0; k < N; k++){
          var g = (((e * .055) + k / N) % 1);
          x.globalAlpha = .34 * (1 - g) * (g > .02 ? 1 : 0);
          x.beginPath(); x.arc(Wd / 2, cy, R * g, 0, Math.PI * 2); x.stroke();
        }
        x.globalAlpha = .16; x.lineWidth = 2.6;     // steady crosshair, no sweep arm
        x.beginPath(); x.moveTo(0, cy); x.lineTo(Wd, cy); x.moveTo(Wd / 2, 0); x.lineTo(Wd / 2, Ht); x.stroke();

      } else if (kind === 'chev') {                 // sellers lane: one direction, always
        var gap = Math.max(140, Wd / 9), off = (e * 11) % gap, hgt = Ht;
        x.lineWidth = Math.max(9, gap * .09);
        for (var b = -3; b < Wd / gap + 4; b++){
          var bx = b * gap + off;
          x.globalAlpha = .09 + .07 * Math.sin(b * .9 + e * .25);
          x.beginPath(); x.moveTo(bx, hgt); x.lineTo(bx + hgt * .42, 0); x.stroke();
        }

      } else {                                      // personal lane: slow rays
        var cx = Wd / 2, cyy = Ht * .52, RAYS = 26, rot = e * .012;
        x.lineWidth = 3.2;
        for (var a = 0; a < RAYS; a++){
          var ang = rot + a * (Math.PI * 2 / RAYS);
          x.globalAlpha = .05 + .07 * (1 + Math.sin(a * 1.7 + e * .3)) / 2;
          x.beginPath(); x.moveTo(cx, cyy);
          x.lineTo(cx + Math.cos(ang) * Wd, cyy + Math.sin(ang) * Wd); x.stroke();
        }
        x.globalAlpha = .22; x.lineWidth = 4;
        x.beginPath(); x.arc(cx, cyy, Math.min(Wd, Ht) * .34, 0, Math.PI * 2); x.stroke();
      }
      x.globalAlpha = 1;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })();

  /* ---- slide renderers --------------------------------------------------
     Four shapes, not one. A wall that only ever shows one giant number reads as
     a screensaver by minute two; rotating the SHAPE is what keeps a long take
     from going visually flat, and it costs nothing on camera. */
  var esc = function(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); };
  var LN  = function(cls, html, i){
    return '<div class="ln ' + cls + '" style="transition-delay:' + (i * 140) + 'ms">' + html + '</div>';
  };

  function render(s){
    var h = '', i = 0;
    if (s.t === 'stack') {
      (s.lines || []).forEach(function(l){
        h += LN('stk' + (l.hi ? ' hi' : ''), esc(l.text != null ? l.text : l), i++);
      });
      if (s.sub) h += LN('sub', s.sub, i++);
    } else if (s.t === 'rows') {
      if (s.kick) h += LN('kick', esc(s.kick), i++);
      h += '<div class="rows">';
      (s.rows || []).forEach(function(r){
        var v = String(r[1]), sz = v.length > 12 ? ' sm' : v.length > 7 ? ' md' : '';
        h += '<div class="ln row" style="transition-delay:' + (i++ * 140) + 'ms">'
           +   '<span class="rl">' + esc(r[0]) + '</span><span class="rd"></span>'
           +   '<span class="rv' + sz + (r[2] ? ' hi' : '') + '">' + esc(v) + '</span></div>';
      });
      h += '</div>';
      if (s.sub) h += LN('sub', s.sub, i++);
    } else if (s.t === 'line') {
      if (s.kick) h += LN('kick', esc(s.kick), i++);
      h += LN('line', s.text, i++);            // trusted markup: <em> marks the accent word
      if (s.sub) h += LN('sub', s.sub, i++);
    } else {                                    // 'fig', the default
      if (s.kick) h += LN('kick', esc(s.kick), i++);
      h += LN('fig', esc(s.fig), i++);
      if (s.lab) h += LN('lab', esc(s.lab), i++);
      if (s.sub) h += LN('sub', s.sub, i++);
    }
    return h;
  }

  var slides = (W.slides || []).slice();
  var idx    = (PANEL - 1) % Math.max(1, slides.length);

  function paint(){
    var box = el('slide'), s = slides[idx % slides.length];
    box.classList.remove('on'); box.classList.add('out');
    setTimeout(function(){
      box.classList.remove('out');
      box.innerHTML = render(s);
      void box.offsetWidth;                     // commit the pre-animation state
      box.classList.add('on');
    }, 700);
    idx++;
  }

  el('brand').innerHTML = W.brand || '';

  var tickHtml = (W.ticker || []).map(function(t){ return '<span>' + t + '</span>'; }).join('');
  el('tick').innerHTML = tickHtml + tickHtml;   // doubled so the -50% loop is seamless

  /* The band scrolls at a FIXED 55 pixels per second, not a fixed duration. A fixed
     duration makes a wall with more ticker text scroll faster, and speed is the one
     property that decides whether the camera reads the band as calm or as a distraction.
     Measured after fonts settle, because the strip is ~30% wider once the mono face
     lands and a pre-font measurement sets every wall a third too fast. */
  (function tickerSpeed(){
    var set = function(){
      var w = el('tick').scrollWidth / 2;        // one copy of the content
      if (w > 0) el('tick').style.animationDuration = Math.round(w / 55) + 's';
    };
    set();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(set);
    addEventListener('resize', set, { passive:true });
  })();

  (function bar(){
    var t0 = performance.now();
    (function tick(t){
      el('bar').style.width = ((((t - t0) / (SECS * 1000)) % 1) * 100).toFixed(2) + '%';
      requestAnimationFrame(tick);
    })(t0);
  })();

  paint();
  setInterval(paint, SECS * 1000);

  /* ---- live market data, best effort, real-estate wall only --------------
     Field names verified against the live payload 2026-08-05 and carried over
     verbatim from the wall this replaces: valley is {active, escrow, sold30d...}
     with no activeCount and no median, openHouses is an OBJECT with .total, and
     the medians live under soldStats.last30. Guessing them cost a round of
     silent empty slides once already. */
  var fmtUsd = function(n){ return '$' + Math.round(n / 1000) + 'K'; };
  if (W.live === 'scoh') (async function live(){
    try{
      var r = await Promise.all([
        fetch('/api/market-snapshot').then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; }),
        fetch('/api/seller-outcomes').then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; })
      ]);
      var snap = r[0], out = r[1], extra = [];
      var v = snap && snap.valley, s30 = snap && snap.soldStats && snap.soldStats.last30;
      if (v && v.active > 0) extra.push({ t:'fig', kick:'On the market today', fig:String(v.active),
        lab:'Homes for sale in the SCV', sub:'Live from the MLS, updated through the day.' });
      if (snap && snap.openHouses && snap.openHouses.total > 0) extra.push({ t:'fig', kick:'This weekend',
        fig:String(snap.openHouses.total), lab:'Open houses in Santa Clarita', sub:'Every one of them, in one place.' });
      if (s30 && s30.median > 0) extra.push({ t:'fig', kick:'Recorded closings', fig:fmtUsd(s30.median),
        lab:'Median close, last 30 days', sub:'What ' + s30.count + ' homes actually sold for. Not an estimate.' });
      if (s30 && s30.dom > 0) extra.push({ t:'fig', kick:'Time on market', fig:String(s30.dom),
        lab:'Median days to sell', sub:'Priced right, homes here are not sitting.' });
      if (snap && snap.monthsSupply > 0) extra.push({ t:'fig', kick:'Supply', fig:String(snap.monthsSupply),
        lab:'Months of inventory', sub:'Under six months still favours the seller.' });
      var st = snap && snap.staleInventory && snap.staleInventory.valley;
      if (st && st.pct > 0) extra.push({ t:'rows', kick:'Sitting over 60 days',
        rows:[['Listings sitting', String(st.stale), 1], ['Out of', String(st.total), 0]],
        sub:'Almost always a pricing decision, not a market.' });
      var bt = snap && snap.soldStats && snap.soldStats.byType30;
      if (bt && bt.singleFamily && bt.singleFamily.median > 0 && bt.condo && bt.condo.median > 0)
        extra.push({ t:'rows', kick:'One valley, three markets', rows:[
          ['Single family', fmtUsd(bt.singleFamily.median), 1],
          ['Condo', fmtUsd(bt.condo.median), 0],
          ['Townhome', bt.townhome && bt.townhome.median ? fmtUsd(bt.townhome.median) : 'n/a', 0]],
          sub:'Medians, last 30 days of recorded closings.' });
      var pt = out && out.priceTrend && out.priceTrend.valley && out.priceTrend.valley.d180;
      if (pt && pt.call) extra.push({ t:'fig', kick:'Price direction, 180 days',
        fig: pt.call === 'flat' ? 'HOLDING' : pt.call === 'up' ? 'RISING' : 'EASING',
        lab:'Measured per square foot',
        sub:'Per square foot, because a median moves when the mix of homes sold changes.' });
      if (extra.length) slides = slides.concat(extra);
    } catch(e){ /* the wall keeps running on the written slides */ }
  })();

  /* ---- live: the latest episode, ConnorWithHonor walls only -----------------
     Same guard as the market fetch. A backdrop that puts a blank or a broken title
     on camera is worse than one that never mentioned the show at all. */
  if (W.live === 'cwh') (async function liveShow(){
    try{
      var v = await fetch('/api/latest-videos').then(function(r){ return r.ok ? r.json() : null; })
                    .catch(function(){ return null; });
      var t = (v && v.episode && v.episode.title) || (v && v.short && v.short.title);
      if (t) slides = slides.concat([{ t:'fig', kick:'Latest episode', fig:'LIVE',
        lab:'The Daily Download', sub: t.length > 96 ? t.slice(0, 93) + '\u2026' : t }]);
    } catch(e){ /* the wall keeps running on the written slides */ }
  })();

  /* F toggles fullscreen; the wall is meant to run chromeless on each monitor */
  addEventListener('keydown', function(e){
    if (e.key.toLowerCase() === 'f') {
      document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
    }
  });

  /* Cursor hides for the camera but comes back on movement so it can be found */
  (function cursor(){
    var h; var show = function(){
      document.body.classList.add('cur-visible');
      clearTimeout(h); h = setTimeout(function(){ document.body.classList.remove('cur-visible'); }, 2500);
    };
    addEventListener('mousemove', show, { passive:true });
    addEventListener('mousedown', show, { passive:true });
  })();
})();
