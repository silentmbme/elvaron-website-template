export function initPartnerCarousel() {
  const carousel = document.querySelector('.partner-carousel');
  if (!carousel) return () => {};

  const viewport = carousel.querySelector('.partner-carousel-viewport');
  const track = carousel.querySelector('.partner-logos');
  if (!viewport || !track) return () => {};

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let timer;
  let resumeTimer;
  let hovered = false;
  let focused = false;
  let interacting = false;
  let resumeAt = 0;

  const stop = () => {
    window.clearInterval(timer);
    window.clearTimeout(resumeTimer);
    timer = undefined;
    resumeTimer = undefined;
  };
  const start = () => {
    stop();
    if (hovered || focused || interacting || document.hidden || reducedMotion.matches || viewport.scrollWidth <= viewport.clientWidth + 1) return;
    if (resumeAt > Date.now()) {
      resumeTimer = window.setTimeout(start, resumeAt - Date.now());
      return;
    }
    timer = window.setInterval(() => {
      const slide = track.querySelector('.partner-logo-slide');
      if (!slide) return;
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
      const step = slide.getBoundingClientRect().width + gap;
      const maxScroll = viewport.scrollWidth - viewport.clientWidth;
      if (maxScroll - viewport.scrollLeft <= 2) {
        viewport.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        viewport.scrollBy({ left: step, behavior: 'smooth' });
      }
    }, 2600);
  };
  const onPointerEnter = () => {
    hovered = true;
    stop();
  };
  const onPointerLeave = () => {
    hovered = false;
    start();
  };
  const onFocusIn = () => {
    focused = true;
    stop();
  };
  const onFocusOut = () => {
    queueMicrotask(() => {
      focused = carousel.contains(document.activeElement);
      start();
    });
  };
  const onPointerDown = () => {
    interacting = true;
    stop();
  };
  const onPointerUp = () => {
    interacting = false;
    resumeAt = Date.now() + 4000;
    start();
  };
  const onVisibilityChange = () => (document.hidden ? stop() : start());
  const onMotionChange = () => (reducedMotion.matches ? stop() : start());
  const resizeObserver = new ResizeObserver(start);

  carousel.addEventListener('pointerenter', onPointerEnter);
  carousel.addEventListener('pointerleave', onPointerLeave);
  carousel.addEventListener('focusin', onFocusIn);
  carousel.addEventListener('focusout', onFocusOut);
  viewport.addEventListener('pointerdown', onPointerDown);
  viewport.addEventListener('pointerup', onPointerUp);
  viewport.addEventListener('pointercancel', onPointerUp);
  document.addEventListener('visibilitychange', onVisibilityChange);
  reducedMotion.addEventListener('change', onMotionChange);
  resizeObserver.observe(viewport);
  start();

  return () => {
    stop();
    window.clearTimeout(resumeTimer);
    carousel.removeEventListener('pointerenter', onPointerEnter);
    carousel.removeEventListener('pointerleave', onPointerLeave);
    carousel.removeEventListener('focusin', onFocusIn);
    carousel.removeEventListener('focusout', onFocusOut);
    viewport.removeEventListener('pointerdown', onPointerDown);
    viewport.removeEventListener('pointerup', onPointerUp);
    viewport.removeEventListener('pointercancel', onPointerUp);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    reducedMotion.removeEventListener('change', onMotionChange);
    resizeObserver.disconnect();
  };
}
