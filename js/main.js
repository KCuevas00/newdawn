/* New Dawn Carpet Cleaning - site scripts (plain JavaScript, no libraries) */
(function () {
  'use strict';

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------- Footer year ---------- */
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Header: style change on scroll ---------- */
  var header = $('#site-header');
  var TOP_CLASSES = 'bg-white/80 backdrop-blur-sm'.split(' ');
  var SCROLLED_CLASSES = 'bg-white/95 backdrop-blur-md border-b border-line shadow-md shadow-deep/5'.split(' ');
  function onScroll() {
    var scrolled = window.scrollY > 16;
    TOP_CLASSES.forEach(function (c) { header.classList.toggle(c, !scrolled); });
    SCROLLED_CLASSES.forEach(function (c) { header.classList.toggle(c, scrolled); });
  }
  if (header) {
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  var toggle = $('#menu-toggle');
  var menu = $('#mobile-menu');
  function setMenu(open) {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    // SVG elements have no .hidden property, so toggle the attribute instead
    $('[data-icon="open"]', toggle).toggleAttribute('hidden', open);
    $('[data-icon="close"]', toggle).toggleAttribute('hidden', !open);
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () { setMenu(menu.hidden); });
    $$('a', menu).forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
  }

  /* ---------- Scroll-reveal ---------- */
  function show(el) { el.classList.add('is-visible'); }
  var triggers = $$('[data-threshold]');
  if (!('IntersectionObserver' in window)) {
    $$('.reveal').forEach(show);
  } else {
    triggers.forEach(function (t) {
      var io = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        if (t.hasAttribute('data-reveal-group')) $$('.reveal', t).forEach(show);
        else show(t);
        io.disconnect();
      }, { threshold: parseFloat(t.getAttribute('data-threshold')) });
      io.observe(t);
    });
  }

  /* ---------- Before / after sliders ---------- */
  $$('[data-slider]').forEach(function (box) {
    var before = $('[data-before]', box);
    var clip = before.parentNode;
    var handle = box.lastElementChild;
    var pos = 50, dragging = false;

    function render() {
      clip.style.width = pos + '%';
      handle.style.left = pos + '%';
      before.style.width = box.clientWidth + 'px'; // keep the "before" photo un-squished
      box.setAttribute('aria-valuenow', Math.round(pos));
    }
    function setFromX(clientX) {
      var r = box.getBoundingClientRect();
      pos = Math.min(100, Math.max(0, (clientX - r.left) / r.width * 100));
      render();
    }
    box.addEventListener('pointerdown', function (e) {
      dragging = true;
      if (box.setPointerCapture) box.setPointerCapture(e.pointerId);
      setFromX(e.clientX);
    });
    box.addEventListener('pointermove', function (e) { if (dragging) setFromX(e.clientX); });
    ['pointerup', 'pointercancel'].forEach(function (ev) {
      box.addEventListener(ev, function () { dragging = false; });
    });
    box.addEventListener('keydown', function (e) {
      var step = { ArrowLeft: -5, ArrowRight: 5 }[e.key];
      if (step) { pos = Math.min(100, Math.max(0, pos + step)); render(); e.preventDefault(); }
      else if (e.key === 'Home') { pos = 0; render(); e.preventDefault(); }
      else if (e.key === 'End') { pos = 100; render(); e.preventDefault(); }
    });
    window.addEventListener('resize', render);
    window.addEventListener('load', render);
    if ('ResizeObserver' in window) {
      new ResizeObserver(render).observe(box);
    }
    if (before.complete) {
      render();
    } else {
      before.addEventListener('load', render);
    }
    render();
    setTimeout(render, 50);
    setTimeout(render, 300);
  });

  /* ---------- Quick-quote form (Web3Forms) ---------- */
  var form = $('#quote-form');
  if (form) {
    var submitBtn = $('#quote-submit');
    var errorBox = $('#quote-error');
    var success = $('#quote-success');
    var idleLabel = submitBtn.textContent;
    var SPINNER = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-circle h-4 w-4 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Sending\u2026';

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);

      errorBox.hidden = true;
      submitBtn.disabled = true;
      submitBtn.innerHTML = SPINNER;

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: data
      })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res.success) {
            form.hidden = true;
            success.hidden = false;
          } else {
            throw new Error(res.message || 'Submission failed');
          }
        })
        .catch(function (err) {
          console.error('Quick quote failed:', err);
          var msg = err.message || '';
          if (msg.toLowerCase().indexOf('access key') !== -1) {
            errorBox.textContent = 'Please configure your Web3Forms Access Key in index.html.';
          } else {
            errorBox.textContent = 'Something went wrong. Please try again or call us directly.';
          }
          errorBox.hidden = false;
          submitBtn.disabled = false;
          submitBtn.textContent = idleLabel;
        });
    });
  }
})();
