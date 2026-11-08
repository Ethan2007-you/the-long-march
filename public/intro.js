/* A small, dependency-free opening also covers the application's download. */
(() => {
  const screen = document.getElementById('march-intro');
  const root = document.getElementById('root');
  if (!screen || !root) return;
  const html = document.documentElement;
  html.dataset.introController = 'ready';
  const status = document.getElementById('intro-status');
  const skip = document.getElementById('intro-skip');
  const retry = document.getElementById('intro-retry');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const directLink = Boolean(location.hash && location.hash !== '#home');
  const minimum = reduced || directLink ? 0 : 1400;
  const started = performance.now();
  const timers = new Set();
  let mounted = false;
  let finished = false;
  let skipped = false;
  let tasks = 0;

  function later(fn, delay) {
    const id = setTimeout(() => { timers.delete(id); fn(); }, delay);
    timers.add(id);
  }
  function update(progress, stage, text) {
    if (finished) return;
    screen.style.setProperty('--intro-progress', String(progress));
    screen.dataset.stage = stage;
    status.textContent = text;
  }
  function updateReady() {
    screen.style.setProperty('--intro-progress', '1');
    screen.dataset.stage = 'ready';
    status.textContent = '山河已展，征途开启';
  }
  function dismiss() {
    if (finished || !mounted) return;
    finished = true;
    for (const id of timers) clearTimeout(id);
    timers.clear();
    const restoreFocus = screen.contains(document.activeElement);
    updateReady();
    html.classList.add('intro-revealing');
    screen.classList.add('is-leaving');
    screen.inert = true;
    screen.setAttribute('aria-hidden', 'true');
    function complete() {
      root.inert = false;
      root.removeAttribute('aria-hidden');
      html.classList.remove('intro-pending', 'intro-revealing');
      screen.remove();
      window.removeEventListener('march:ready', mount);
      if (restoreFocus || directLink) {
        const hash = location.hash;
        const target = /^#events-(?:[1-9]|10)$/.test(hash)
          ? document.querySelector(hash + ' h3')
          : /^#route(?:-(?:[1-9]|10))?$/.test(hash)
            ? document.querySelector('.atlas-text h3')
            : document.querySelector(hash === '#home-route' ? '#home-route-title' : '.site [aria-current="location"]');
        if (target) {
          if (!target.hasAttribute('tabindex') && !target.matches('a[href],button')) target.setAttribute('tabindex', '-1');
          target.focus({preventScroll: true});
        }
      }
      window.dispatchEvent(new Event('march:entered'));
    }
    if (reduced) complete();
    else setTimeout(complete, 680);
  }
  function settled() {
    if (finished) return;
    tasks += 1;
    update(.34 + tasks * .33, tasks === 1 ? 'landscape' : 'ready', tasks === 1 ? '山河渐显' : '山河已展，征途开启');
    if (tasks === 2) {
      updateReady();
      later(dismiss, Math.max(0, minimum - (performance.now() - started)));
    }
  }
  function mount() {
    if (mounted || finished) return;
    mounted = true;
    update(.34, 'mounted', '展卷 · 山河渐显');
    if (skipped) { dismiss(); return; }
    // Also cap the wait when the bundle arrives after the initial slow-load notice.
    later(dismiss, 5000);
    // Images are observed, not re-requested; errors also let visitors continue.
    const poster = document.querySelector('.hero-poster');
    const imageReady = poster && !directLink
      ? poster.decode().catch(() => {})
      : Promise.resolve();
    imageReady.then(settled);
    const fontsReady = document.fonts
      ? Promise.allSettled([
          document.fonts.load('400 120px "March Running"', '长'),
          document.fonts.load('400 120px "March Brush"', '征'),
        ])
      : Promise.resolve();
    fontsReady.then(settled);
  }
  retry.addEventListener('click', event => { event.preventDefault(); location.reload(); });
  skip.addEventListener('click', () => {
    skipped = true;
    if (mounted) dismiss();
    else { skip.textContent = '正在进入…'; status.textContent = '展览正在准备，即将进入'; }
  });
  later(() => {
    if (mounted) dismiss();
    else {
      status.textContent = '加载较慢，展览仍在准备';
      retry.hidden = false;
      skip.hidden = true;
    }
  }, 6500);
  window.addEventListener('march:ready', mount);
  if (html.dataset.exhibitReady === 'true') mount();
})();
