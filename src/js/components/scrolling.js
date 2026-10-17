import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initScrolling() {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let lenis;
  const tick = time => lenis?.raf(time * 1000);
  const configure = () => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = undefined;
    if (motion.matches) return;
    lenis = new Lenis({
      duration:1.15,
      easing:t => Math.min(1,1.001 - Math.pow(2,-10*t)),
      smoothWheel:true,
      syncTouch:false,
      autoRaf:false,
      prevent:node => Boolean(node.closest('.offcanvas,.dropdown-menu,textarea,select,[data-lenis-prevent]')),
    });
    lenis.on('scroll',ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    if (document.querySelector('.offcanvas.show,.offcanvas.showing')) lenis.stop();
  };
  const stop = () => lenis?.stop();
  const start = () => lenis?.start();
  motion.addEventListener('change',configure);
  document.addEventListener('show.bs.offcanvas',stop);
  document.addEventListener('hidden.bs.offcanvas',start);
  configure();
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden','true');
  const top = document.createElement('a');
  top.className = 'back-to-top';
  top.href = '#main';
  top.setAttribute('aria-label','Back to top');
  top.innerHTML = '<i class="ri-arrow-up-line" aria-hidden="true"></i>';
  document.body.append(progress,top);
  let frame = 0;
  const update = () => {
    frame = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1,Math.max(0,scrollY/max)) : 0})`;
    top.classList.toggle('is-visible',scrollY > 600);
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  const onClick = event => {
    const anchor = event.target.closest?.('a[href]');
    if (!anchor || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || anchor.hasAttribute('download') || anchor.target) return;
    const url = new URL(anchor.href,location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
    let id;
    try { id = decodeURIComponent(url.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const hadTabindex = target.hasAttribute('tabindex');
    if (!hadTabindex) {
      target.setAttribute('tabindex','-1');
      target.addEventListener('blur',()=>target.removeAttribute('tabindex'),{once:true});
    }
    target.focus({preventScroll:true});
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (lenis) lenis.scrollTo(anchor === top ? 0 : target,{offset:anchor === top ? 0 : -110});
    else if (anchor === top) window.scrollTo({top:0,behavior:reduced?'instant':'smooth'});
    else target.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});
    if (location.hash !== url.hash) history.pushState(null,'',url.hash);
  };
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  document.addEventListener('click',onClick);
  update();
  return () => {
    cancelAnimationFrame(frame);
    gsap.ticker.remove(tick);
    lenis?.destroy();
    motion.removeEventListener('change',configure);
    document.removeEventListener('show.bs.offcanvas',stop);
    document.removeEventListener('hidden.bs.offcanvas',start);
    window.removeEventListener('scroll',schedule);
    window.removeEventListener('resize',schedule);
    document.removeEventListener('click',onClick);
    progress.remove();top.remove();
  };
}
