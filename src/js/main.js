import '../scss/main.scss';
import { initNavigation } from './components/navigation.js';
import { initForms } from './components/forms.js';
import { initPageContent } from './components/page-content.js';
import { initPartnerCarousel } from './components/partner-carousel.js';
import { initGrowthWorkCarousel } from './components/growth-work-carousel.js';
import { initCreativeWorkGallery } from './components/creative-work-gallery.js';
import { initTeamSocial } from './components/team-social.js';
import { initTestimonialCarousel } from './components/testimonial-carousel.js';
import { initBlogArticle } from './components/blog-article.js';
import { initThemeToggle } from './components/theme-toggle.js';

function initializeSite() {
// The inline loader dismisses independently of module downloads.
const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();
document.documentElement.classList.remove('no-js');
initNavigation();
const cleanupThemeToggle = initThemeToggle();
initForms();
const cleanupBlogArticle = initBlogArticle();
initPageContent();
// Initialize below-the-fold widgets as they approach the viewport.
const whenVisible = (selector, initialize) => {
  const element = document.querySelector(selector);
  if (!element) return () => {};
  let cleanup = () => {};
  if (!('IntersectionObserver' in window)) return initialize();
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    cleanup = initialize();
  }, { rootMargin: '200px' });
  observer.observe(element);
  return () => { observer.disconnect(); cleanup(); };
};
const cleanupPartnerCarousel = whenVisible('.partner-carousel', initPartnerCarousel);
const cleanupGrowthWorkCarousel = whenVisible('.growth-work-carousel', initGrowthWorkCarousel);
const cleanupCreativeWorkGallery = whenVisible('#creative-work-gallery', initCreativeWorkGallery);
const cleanupTeamSocial = initTeamSocial();
const cleanupTestimonialCarousel = whenVisible('#creative-stories-carousel', initTestimonialCarousel);
let cleanupAnimations = () => {};
let cleanupScrolling = () => {};
let disposed = false;
const startEnhancements = async () => {
  const [animations, scrolling] = await Promise.all([
    import('./animations/reveals.js'),
    import('./components/scrolling.js'),
  ]);
  if (disposed) return;
  cleanupAnimations = animations.initAnimations();
  cleanupScrolling = scrolling.initScrolling();
};
// Allow the browser to paint and handle essential controls before loading animation libraries.
const deferEnhancements = () => {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if ('requestIdleCallback' in window) window.requestIdleCallback(startEnhancements, { timeout: 1500 });
    else window.setTimeout(startEnhancements, 0);
  }));
};
const interactionEvents = ['pointerdown', 'touchstart', 'wheel', 'keydown'];
const startOnInteraction = () => {
  interactionEvents.forEach(event => window.removeEventListener(event, startOnInteraction));
  deferEnhancements();
};
// On smaller devices, load decorative motion when the visitor starts interacting.
if (matchMedia('(max-width: 991px)').matches) {
  interactionEvents.forEach(event => window.addEventListener(event, startOnInteraction, { once: true, passive: true }));
} else if (document.readyState === 'complete') deferEnhancements();
else window.addEventListener('load', deferEnhancements, { once: true });
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    disposed = true;
    interactionEvents.forEach(event => window.removeEventListener(event, startOnInteraction));
    window.removeEventListener('load', deferEnhancements);
    cleanupThemeToggle();
    cleanupPartnerCarousel();
    cleanupGrowthWorkCarousel();
    cleanupCreativeWorkGallery();
    cleanupTeamSocial();
    cleanupTestimonialCarousel();
    cleanupBlogArticle();
    cleanupAnimations();
    cleanupScrolling();
  });

}
Promise.resolve(window.elvaronStylesReady).then(initializeSite);
