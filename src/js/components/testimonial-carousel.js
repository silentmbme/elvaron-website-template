import Carousel from 'bootstrap/js/dist/carousel';

export function initTestimonialCarousel() {
  const element = document.querySelector('#creative-stories-carousel');
  if (!element) return () => {};

  const carousel = Carousel.getOrCreateInstance(element, {
    interval: Number(element.dataset.bsInterval) || 6500,
    pause: 'hover',
    touch: true,
    wrap: true,
  });
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let isVisible = false;
  let isHovered = element.matches(':hover');
  let isFocused = element.contains(document.activeElement);

  const updatePlayback = () => {
    if (motionPreference.matches || document.visibilityState !== 'visible' || !isVisible || isHovered || isFocused) {
      carousel.pause();
      return;
    }

    carousel.cycle();
  };

  const onPointerEnter = () => {
    isHovered = true;
    updatePlayback();
  };
  const onPointerLeave = () => {
    isHovered = false;
    updatePlayback();
  };
  const onFocusIn = () => {
    isFocused = true;
    updatePlayback();
  };
  const onFocusOut = () => {
    window.setTimeout(() => {
      isFocused = element.contains(document.activeElement);
      updatePlayback();
    }, 0);
  };
  const onVisibilityChange = () => updatePlayback();
  const onMotionChange = () => updatePlayback();

  element.addEventListener('pointerenter', onPointerEnter);
  element.addEventListener('pointerleave', onPointerLeave);
  element.addEventListener('focusin', onFocusIn);
  element.addEventListener('focusout', onFocusOut);
  document.addEventListener('visibilitychange', onVisibilityChange);
  motionPreference.addEventListener?.('change', onMotionChange);

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        updatePlayback();
      }, { threshold: 0.2 })
    : null;

  if (observer) observer.observe(element);
  else isVisible = true;
  updatePlayback();

  return () => {
    observer?.disconnect();
    element.removeEventListener('pointerenter', onPointerEnter);
    element.removeEventListener('pointerleave', onPointerLeave);
    element.removeEventListener('focusin', onFocusIn);
    element.removeEventListener('focusout', onFocusOut);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    motionPreference.removeEventListener?.('change', onMotionChange);
    carousel.dispose();
  };
}
