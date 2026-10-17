export function initGrowthWorkCarousel() {
  const carousel = document.querySelector('.growth-work-carousel');
  const track = carousel?.querySelector('.growth-work-track');
  if (!carousel || !track) return () => {};

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const originals = Array.from(track.children);
  if (originals.length < 2) return () => {};

  originals.forEach((card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.inert = true;
    track.append(clone);
  });

  let timer;
  let paused = false;
  let moving = false;
  const stop = () => window.clearTimeout(timer);
  const schedule = () => {
    stop();
    if (paused || document.hidden || reducedMotion.matches) return;
    timer = window.setTimeout(advance, 3600);
  };
  const advance = () => {
    if (paused || moving || reducedMotion.matches) return;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    const cardsPerStep = window.matchMedia('(max-width: 600px)').matches ? 1 : 2;
    const cards = Array.from(track.children).slice(0, cardsPerStep);
    const distance = cards.reduce((width, card) => width + card.getBoundingClientRect().width, 0)
      + gap * (cards.length - 1);
    moving = true;
    track.style.transition = 'transform 650ms cubic-bezier(0.22, 1, 0.36, 1)';
    track.style.transform = `translate3d(${-distance}px, 0, 0)`;
    track.addEventListener('transitionend', () => {
      cards.forEach((card) => track.append(card));
      track.style.transition = 'none';
      track.style.transform = 'translate3d(0, 0, 0)';
      requestAnimationFrame(() => {
        track.style.transition = '';
        moving = false;
        schedule();
      });
    }, { once: true });
  };
  const onEnter = () => { paused = true; stop(); };
  const onLeave = () => { paused = false; schedule(); };
  const onFocusIn = () => { paused = true; stop(); };
  const onFocusOut = () => {
    queueMicrotask(() => {
      paused = carousel.contains(document.activeElement) || carousel.matches(':hover');
      schedule();
    });
  };
  const onVisibility = () => schedule();
  const onMotion = () => schedule();

  carousel.addEventListener('pointerenter', onEnter);
  carousel.addEventListener('pointerleave', onLeave);
  carousel.addEventListener('focusin', onFocusIn);
  carousel.addEventListener('focusout', onFocusOut);
  document.addEventListener('visibilitychange', onVisibility);
  reducedMotion.addEventListener('change', onMotion);
  schedule();

  return () => {
    stop();
    carousel.removeEventListener('pointerenter', onEnter);
    carousel.removeEventListener('pointerleave', onLeave);
    carousel.removeEventListener('focusin', onFocusIn);
    carousel.removeEventListener('focusout', onFocusOut);
    document.removeEventListener('visibilitychange', onVisibility);
    reducedMotion.removeEventListener('change', onMotion);
  };
}
