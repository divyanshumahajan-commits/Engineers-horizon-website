(function () {
  if (window.EHMotion) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ease = 'cubic-bezier(.16,1,.3,1)';
  var seen = new WeakSet();

  // Phone polish: lift the smallest 10px labels to 11px on narrow screens so they stay readable.
  (function () {
    var css = document.createElement('style');
    css.setAttribute('data-eh-mobile', '');
    css.textContent = '@media (max-width:600px){[style*="font-size:10px"],[style*="font-size: 10px"]{font-size:11px!important}}';
    (document.head || document.documentElement).appendChild(css);
  })();

  // Elements waiting to animate in. Played when they reach the screen.
  var waiting = new Set();
  function play(el) {
    if (el.__ehA) el.__ehA.play();
    if (el.__ehCount) el.__ehCount();
    waiting.delete(el);
    io.unobserve(el);
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) play(e.target); });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
  // Backup check by position. The observer above never fires for elements that start fully clipped
  // (the "mask" and "unveil" reveals), so without this those headings and images would stay hidden.
  var checking = false;
  function checkWaiting() {
    if (checking || !waiting.size) return; checking = true;
    requestAnimationFrame(function () {
      checking = false;
      var limit = innerHeight * 0.94;
      waiting.forEach(function (el) {
        if (!el.isConnected) { waiting.delete(el); return; }
        var r = el.getBoundingClientRect();
        if (r.top < limit && r.bottom > 0 && (r.width || r.height)) play(el);
      });
    });
  }
  addEventListener('scroll', checkWaiting, { passive: true });
  addEventListener('resize', checkWaiting);
  addEventListener('load', checkWaiting);

  var KF = {
    fade: [{ opacity: 0 }, { opacity: 1 }],
    rise: [{ opacity: 0, transform: 'translateY(28px)' }, { opacity: 1, transform: 'none' }],
    'rise-lg': [{ opacity: 0, transform: 'translateY(80px)' }, { opacity: 1, transform: 'none' }],
    zoom: [{ opacity: 0, transform: 'scale(1.08)' }, { opacity: 1, transform: 'none' }],
    unveil: [{ clipPath: 'inset(0 0 100% 0)', transform: 'scale(1.12)' }, { clipPath: 'inset(0 0 0% 0)', transform: 'none' }],
    mask: [{ clipPath: 'inset(0 0 100% 0)', transform: 'translateY(36px)', opacity: 0 }, { clipPath: 'inset(0 0 -20% 0)', transform: 'none', opacity: 1 }],
    line: [{ transform: 'scaleX(0)', transformOrigin: 'left' }, { transform: 'none', transformOrigin: 'left' }]
  };
  var DUR = { fade: 900, rise: 1000, 'rise-lg': 1500, zoom: 1600, unveil: 1400, line: 1200, mask: 1200 };

  function animate(el, kind, delay, immediate) {
    if (reduce || !el.animate) return;
    var a = el.animate(KF[kind] || KF.rise, { duration: DUR[kind] || 1000, delay: delay || 0, easing: ease, fill: 'both' });
    a.onfinish = function () { a.cancel(); };
    if (immediate) return;
    a.pause(); el.__ehA = a; io.observe(el);
    waiting.add(el); checkWaiting();
  }

  function attachDeclared(el) {
    if (seen.has(el)) return; seen.add(el);
    animate(el, el.getAttribute('data-reveal'), +el.getAttribute('data-delay') || 0, el.hasAttribute('data-load'));
  }

  var AUTO = 'h1,h2,h3,p,blockquote,img,article,figure,details,form,iframe,label,li,a[style*="border"],button[style*="border"]';
  function skip(el) {
    if (el.closest('[data-reveal],[data-no-motion]')) return true;
    var p = el.parentElement;
    while (p && p !== document.body) {
      if (p.__ehAuto) return true;
      var s = p.getAttribute && p.getAttribute('style') || '';
      if (/position:\s*fixed/.test(s)) return true;
      if (/overflow-x:\s*(auto|scroll)/.test(s)) return true; // swipe rows: items off to the side would stay hidden
      p = p.parentElement;
    }
    var st = el.getAttribute('style') || '';
    if (/opacity/.test(st)) return true;
    if (el.tagName === 'IMG' && /position:\s*absolute/.test(st)) return true;
    if (el.closest('section') && el.closest('section') === document.querySelector('section')) return true;
    return false;
  }
  function attachAuto(el) {
    if (seen.has(el)) return; seen.add(el);
    if (skip(el)) return;
    el.__ehAuto = true;
    var sibs = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
    var delay = Math.min(sibs, 5) * 70;
    var r = el.getBoundingClientRect();
    var kind = el.tagName === 'IMG' && r.width > 220 ? 'unveil' : el.tagName === 'IFRAME' ? 'fade' : 'rise';
    animate(el, kind, delay, false);
  }

  function attachCount(el) {
    if (seen.has(el) || el.__ehCountDone) return;
    var txt = (el.textContent || '').trim();
    var m = /^(\d[\d,]*)(\+?)$/.exec(txt);
    if (!m || el.children.length) return;
    var target = parseInt(m[1].replace(/,/g, ''), 10);
    if (!(target > 1)) return;
    seen.add(el); el.__ehCountDone = true;
    if (reduce) return;
    var pad = m[1].length > 1 && m[1][0] === '0' ? m[1].length : 0;
    var fmt = function (n) { var s = pad ? String(n).padStart(pad, '0') : n.toLocaleString('en-IN'); return s + m[2]; };
    el.__ehCount = function () {
      var t0 = performance.now(), D = 1600;
      (function step(t) {
        var k = Math.min(1, (t - t0) / D); k = 1 - Math.pow(1 - k, 3);
        el.textContent = fmt(Math.round(target * k));
        if (k < 1) requestAnimationFrame(step); else el.textContent = txt;
      })(t0);
    };
    io.observe(el);
  }

  function scan(root) {
    if (!root.querySelectorAll) return;
    if (root.matches && root.matches('[data-reveal]')) attachDeclared(root);
    root.querySelectorAll('[data-reveal]').forEach(attachDeclared);
    if (root.matches && root.matches(AUTO)) attachAuto(root);
    root.querySelectorAll(AUTO).forEach(attachAuto);
    root.querySelectorAll('div,span').forEach(attachCount);
  }

  var pending = new Set(), raf = 0;
  new MutationObserver(function (ms) {
    ms.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.nodeType === 1) pending.add(n); }); });
    if (!raf) raf = requestAnimationFrame(function () { raf = 0; pending.forEach(scan); pending.clear(); });
  }).observe(document.documentElement, { childList: true, subtree: true });

  // Hero parallax + scroll progress
  var bar = document.createElement('div');
  bar.setAttribute('data-no-motion', '');
  bar.style.cssText = 'position:fixed;top:0;left:0;height:2px;width:100%;background:#A8643F;transform-origin:left;transform:scaleX(0);z-index:100;pointer-events:none;';
  function mountBar() { if (document.body && !bar.isConnected) document.body.appendChild(bar); }
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false; mountBar();
      var y = window.scrollY, H = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (H > 0 ? y / H : 0) + ')';
      if (reduce) return;
      var hero = document.querySelector('section');
      if (!hero || hero.offsetHeight < innerHeight * 0.8 || y > innerHeight * 1.4) return;
      hero.querySelectorAll('img[data-load]').forEach(function (im) { if (!im.closest('a')) im.style.translate = '0 ' + (y * 0.3).toFixed(1) + 'px'; });
      hero.querySelectorAll('[data-reveal="rise-lg"]').forEach(function (w) { w.style.translate = '0 ' + (y * 0.5).toFixed(1) + 'px'; });
    });
  }
  addEventListener('scroll', onScroll, { passive: true });

  // Page transitions
  // Only on the live site: inside the design canvas (an embedded frame) the canvas handles page links itself.
  var embedded = window.__omEditor === 1;
  try { embedded = embedded || window.parent !== window; } catch (e) { embedded = true; }
  if (!reduce && !embedded && document.documentElement.animate) {
    document.documentElement.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, easing: 'ease-out' });
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
      var href = a.getAttribute('href');
      if (!href || href[0] === '#' || /^(mailto:|tel:|https?:)/.test(href) || !/\.dc\.html/.test(href)) return;
      if (href.split('#')[0] === location.pathname.split('/').pop()) return;
      e.preventDefault();
      var an = document.documentElement.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, easing: 'ease-in', fill: 'forwards' });
      an.onfinish = function () { location.href = href; };
    });
    addEventListener('pageshow', function (e) { if (e.persisted) document.documentElement.getAnimations().forEach(function (x) { x.cancel(); }); });
  }

  // Section jumps (e.g. "#location"). Pages build their content after loading, so wait for the section
  // to exist, then scroll to it below the sticky menu bar. Works for links on the same page and from other pages.
  function stickyOffset() {
    var h = 0;
    document.querySelectorAll('header').forEach(function (el) { var cs = getComputedStyle(el); if (cs.position === 'sticky' || cs.position === 'fixed') h = Math.max(h, el.getBoundingClientRect().height); });
    return h + 12;
  }
  function jumpTo(id, smooth) {
    if (!id) return;
    var tries = 0;
    (function find() {
      var el = document.getElementById(id);
      if (!el) { if (++tries < 60) setTimeout(find, 100); return; }
      var go = function (b) { var y = el.getBoundingClientRect().top + window.scrollY - stickyOffset(); window.scrollTo({ top: Math.max(0, y), behavior: b }); };
      go(smooth ? 'smooth' : 'auto');
      setTimeout(function () { go('auto'); checkWaiting(); }, smooth ? 700 : 400); // settle after images/animations shift the layout
    })();
  }
  function pageName(p) { try { return decodeURIComponent((p || '').split('#')[0].split('?')[0].split('/').pop() || 'Home.dc.html'); } catch (e) { return p; } }
  var JUMP_KEY = 'eh_jump';
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    var href = a.getAttribute('href') || '';
    var i = href.indexOf('#');
    if (i < 0 || /^(mailto:|tel:|https?:)/.test(href)) return;
    var id = decodeURIComponent(href.slice(i + 1)); if (!id) return;
    var target = href.slice(0, i);
    if (!target || pageName(target) === pageName(location.pathname)) {
      e.preventDefault(); e.stopPropagation();
      try { history.replaceState(null, '', '#' + id); } catch (err) {}
      jumpTo(id, true);
    } else {
      // going to another page: remember the section in case the hash gets lost on the way
      try { sessionStorage.setItem(JUMP_KEY, JSON.stringify({ page: pageName(target), id: id, t: Date.now() })); } catch (err) {}
    }
  }, true);
  (function onArrive() {
    var id = '';
    if (location.hash.length > 1) { try { id = decodeURIComponent(location.hash.slice(1)); } catch (e) {} }
    try {
      var j = JSON.parse(sessionStorage.getItem(JUMP_KEY) || 'null');
      if (j && Date.now() - j.t < 15000 && j.page === pageName(location.pathname)) id = id || j.id;
      sessionStorage.removeItem(JUMP_KEY);
    } catch (e) {}
    if (id) jumpTo(id, false);
  })();
  addEventListener('hashchange', function () { if (location.hash.length > 1) jumpTo(decodeURIComponent(location.hash.slice(1)), true); });

  scan(document);
  window.EHMotion = { scan: scan };
})();
