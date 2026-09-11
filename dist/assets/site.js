const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#mobile-menu');
const background = [...document.querySelectorAll('main, footer, .mobile-reserve, .header .brand, .header .reserve')];
let previousScroll = 0;
function setMenu(open, restoreFocus = false) {
  if (!toggle || !menu) return;
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  menu.hidden = !open;
  if (open) {
    previousScroll = window.scrollY;
    document.body.style.top = '-' + previousScroll + 'px';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
  } else if (document.body.classList.contains('nav-open')) {
    document.body.style.removeProperty('top');
    document.body.style.removeProperty('position');
    document.body.style.removeProperty('width');
    window.scrollTo({top: previousScroll, behavior: 'instant'});
  }
  document.body.classList.toggle('nav-open', open);
  document.dispatchEvent(new Event('navigation-visibility-change'));
  background.forEach(node => { node.inert = open; });
  if (open) menu.querySelector('a')?.focus();
  else if (restoreFocus) toggle.focus();
}

// Unobstructed silent footage, loaded only while visible.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const connection = navigator.connection;
document.querySelectorAll('[data-ambient-video]').forEach(video => {
  let visible = false;
  let wantsPlayback = !reducedMotion.matches && !connection?.saveData;
  let failed = false;
  let starting = false;
  const canPlay = () => visible && wantsPlayback && !failed && !document.hidden && !document.body.classList.contains('nav-open');
  async function syncPlayback() {
    if (!canPlay()) { video.pause(); return; }
    if (starting || !video.paused) return;
    if (!video.getAttribute('src')) {
      video.src = matchMedia('(max-width:760px)').matches ? video.dataset.mobileSrc : video.dataset.src;
    }
    video.muted = true;
    video.defaultMuted = true;
    starting = true;
    try {
      await video.play();
      if (!canPlay()) video.pause();
    } catch (error) {
      // Low-power/autoplay restrictions keep the still photo visible.
      if (error.name !== 'AbortError') wantsPlayback = false;
    } finally {
      starting = false;
    }
  }
  video.addEventListener('playing', () => video.classList.add('has-played'));
  video.addEventListener('error', () => {
    failed = true;
    video.pause();
    video.classList.remove('has-played');
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      syncPlayback();
    }, {threshold: .1}).observe(video);
  } else {
    visible = true;
    syncPlayback();
  }
  document.addEventListener('visibilitychange', syncPlayback);
  document.addEventListener('navigation-visibility-change', syncPlayback);
  window.addEventListener('pagehide', () => video.pause());
  window.addEventListener('pageshow', syncPlayback);
  function resetPreference() {
    wantsPlayback = !reducedMotion.matches && !connection?.saveData;
    syncPlayback();
  }
  reducedMotion.addEventListener('change', resetPreference);
  connection?.addEventListener('change', resetPreference);
});
toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true', true));
menu?.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', event => {
  if (toggle?.getAttribute('aria-expanded') !== 'true') return;
  if (event.key === 'Escape') { event.preventDefault(); setMenu(false, true); }
  if (event.key === 'Tab') {
    const links = [...menu.querySelectorAll('a')];
    const first = links[0], last = links.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); toggle.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); toggle.focus(); }
    else if (document.activeElement === toggle) { event.preventDefault(); (event.shiftKey ? last : first)?.focus(); }
  }
});
matchMedia('(min-width: 1101px)').addEventListener('change', event => { if (event.matches) setMenu(false); });
window.addEventListener('pageshow', () => setMenu(false));
if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('revealed'); observer.unobserve(entry.target);
    }
  }, {threshold: .04});
  document.querySelectorAll('[data-reveal]').forEach(node => {
    node.classList.add('will-reveal'); observer.observe(node);
  });
}
