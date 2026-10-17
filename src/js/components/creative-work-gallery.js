export function initCreativeWorkGallery() {
  const gallery = document.querySelector('#creative-work-gallery');
  const previous = document.querySelector('[data-case-prev]');
  const next = document.querySelector('[data-case-next]');
  const cards = gallery?.querySelectorAll('.growth-alt-case-card');
  if (!gallery || !previous || !next || !cards?.length) return () => {};

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const autoplayDelay = 4200;
  let timer;
  let isVisible = true;
  let isPaused = false;

  const scroll = (direction) => {
    const gap = Number.parseFloat(getComputedStyle(gallery).gap) || 0;
    const distance = cards[0].getBoundingClientRect().width + gap;
    const maxScroll = gallery.scrollWidth - gallery.clientWidth;
    const atStart = gallery.scrollLeft <= 2;
    const atEnd = gallery.scrollLeft >= maxScroll - 2;

    if (direction > 0 && atEnd) {
      gallery.scrollTo({ left: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    } else if (direction < 0 && atStart) {
      gallery.scrollTo({ left: maxScroll, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    } else {
      gallery.scrollBy({ left: direction * distance, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    }
  };
  const onPrevious = () => scroll(-1);
  const onNext = () => scroll(1);
  const stopAutoplay = () => {
    window.clearInterval(timer);
    timer = undefined;
  };
  const startAutoplay = () => {
    stopAutoplay();
    if (!isPaused && isVisible && !reducedMotion.matches && cards.length > 1) {
      timer = window.setInterval(() => scroll(1), autoplayDelay);
    }
  };
  const pauseAutoplay = () => {
    isPaused = true;
    stopAutoplay();
  };
  const resumeAutoplay = () => {
    isPaused = false;
    startAutoplay();
  };
  const onVisibilityChange = () => {
    isVisible = document.visibilityState === 'visible';
    startAutoplay();
  };
  const onMotionPreferenceChange = () => startAutoplay();
  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting && document.visibilityState === 'visible';
        startAutoplay();
      }, { threshold: 0.2 })
    : null;

  previous.addEventListener('click', onPrevious);
  next.addEventListener('click', onNext);
  gallery.addEventListener('mouseenter', pauseAutoplay);
  gallery.addEventListener('mouseleave', resumeAutoplay);
  gallery.addEventListener('focusin', pauseAutoplay);
  gallery.addEventListener('focusout', resumeAutoplay);
  gallery.addEventListener('touchstart', pauseAutoplay, { passive: true });
  gallery.addEventListener('touchend', resumeAutoplay, { passive: true });
  document.addEventListener('visibilitychange', onVisibilityChange);
  reducedMotion.addEventListener?.('change', onMotionPreferenceChange);
  observer?.observe(gallery);
  startAutoplay();

  return () => {
    stopAutoplay();
    observer?.disconnect();
    previous.removeEventListener('click', onPrevious);
    next.removeEventListener('click', onNext);
    gallery.removeEventListener('mouseenter', pauseAutoplay);
    gallery.removeEventListener('mouseleave', resumeAutoplay);
    gallery.removeEventListener('focusin', pauseAutoplay);
    gallery.removeEventListener('focusout', resumeAutoplay);
    gallery.removeEventListener('touchstart', pauseAutoplay);
    gallery.removeEventListener('touchend', resumeAutoplay);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    reducedMotion.removeEventListener?.('change', onMotionPreferenceChange);
  };
}
