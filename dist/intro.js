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
    screen.inert = true;
    screen.setAttribute('aria-hidden', 'true');
    let transition = null;
    const sourceLetters = [...screen.querySelectorAll('.intro-word > span')];
    const heroLetters = [...document.querySelectorAll('.hero-word > span')];
    const names = ['march-long', 'march-zheng'];
    const interrupt = () => transition?.skipTransition();
    let completed = false;
    function complete() {
      if (completed) return;
      completed = true;
      root.inert = false;
      root.removeAttribute('aria-hidden');
      html.classList.remove('intro-pending', 'intro-revealing', 'intro-title-transfer');
      html.style.removeProperty('--intro-flight-duration');
      for (const letter of [...sourceLetters, ...heroLetters]) letter.style.removeProperty('view-transition-name');
      window.removeEventListener('resize', interrupt);
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
    if (reduced) { complete(); return; }
    const homeVisible = document.querySelector('.home-chapter')?.hidden === false;
    if (!directLink && homeVisible && sourceLetters.length === 2 && heroLetters.length === 2 && document.startViewTransition) {
      // Both words share typography. Named glyph snapshots preserve their exact
      // painted bounds while the browser interpolates position and uniform scale.
      html.classList.add('intro-title-transfer');
      html.style.setProperty('--intro-flight-duration', skipped ? '420ms' : '1050ms');
      sourceLetters.forEach((letter, index) => { letter.style.viewTransitionName = names[index]; });
      try {
        transition = document.startViewTransition(() => {
          screen.remove();
          html.dataset.introLanded = 'true';
          heroLetters.forEach((letter, index) => { letter.style.viewTransitionName = names[index]; });
        });
        window.addEventListener('resize', interrupt, {passive: true});
        transition.ready.catch(() => {}); // Hidden tabs/resizes can skip snapshots.
        transition.finished.then(complete, complete);
        return;
      } catch {
        sourceLetters.forEach(letter => letter.style.removeProperty('view-transition-name'));
        html.classList.remove('intro-title-transfer');
      }
    }
    // Older browsers and direct chapter links retain a lightweight fade.
    html.classList.add('intro-revealing');
    screen.classList.add('is-leaving');
    setTimeout(complete, 680);
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
