import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initAnimations() {
  const media = gsap.matchMedia();
  media.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 992px)' }, (context) => {
    if (!context.conditions.motion) return;
    // Keep above-the-fold headings and images visible for immediate rendering.
    const cards = gsap.utils.toArray('.service-card,.project-card,.process-card,.pricing-card,.blog-card,.team-card,.benefit-row').filter(element => element.getBoundingClientRect().top >= innerHeight);
    const cardSet = new Set(cards);
    gsap.utils.toArray('.reveal,.article-layout,.detail-sidebar,.comparison-table,.faq-page').filter(element => !cardSet.has(element) && !element.matches('.section-heading') && element.getBoundingClientRect().top >= innerHeight).forEach((element) => {
      gsap.from(element, {
        y:28, autoAlpha:0, duration:.7, ease:'power2.out', clearProps:'opacity,visibility,transform',
        scrollTrigger:{ trigger:element, start:'top 94%', once:true },
      });
    });
    gsap.utils.toArray('.section-heading h2').forEach((heading) => {
      gsap.from(heading, {
        y:30, autoAlpha:0, clipPath:'inset(0 0 100% 0)', duration:.85, ease:'power3.out',
        clearProps:'opacity,visibility,transform,clipPath',
        scrollTrigger:{ trigger:heading.closest('.section-heading'), start:'top 88%', once:true },
      });
    });
    gsap.utils.toArray('.growth-alt-featured-case-card').forEach((card) => {
      const content = card.querySelectorAll('.growth-alt-featured-case-meta,.growth-alt-featured-case-content h2,.growth-alt-featured-case-summary,.growth-alt-featured-case-stats,.growth-alt-featured-case-cta');
      if (!content.length) return;
      gsap.from(content, {
        y:22, autoAlpha:0, duration:.72, stagger:.1, ease:'power3.out', clearProps:'opacity,visibility,transform',
        scrollTrigger:{ trigger:card, start:'top 78%', once:true },
      });
    });
    // Forms remain visible and keyboard-reachable before entering the viewport.
    gsap.utils.toArray('.contact-form').forEach(element => {
      gsap.from(element,{y:24,duration:.7,ease:'power3.out',clearProps:'transform',scrollTrigger:{trigger:element,start:'top 94%',once:true}});
    });
    // Batch cards entering together instead of scheduling an independent timeline per card.
    if (cards.length) {
      gsap.set(cards,{ y:context.conditions.desktop ? 32 : 18, opacity:0 });
      ScrollTrigger.batch(cards, {
        start:'top 96%', once:true, interval:.12, batchMax:3,
        onEnter:batch => gsap.to(batch,{ y:0,opacity:1,duration:.7,stagger:.09,ease:'power3.out',clearProps:'opacity,transform' }),
      });
    }
    gsap.utils.toArray('[data-image-reveal],.hero-photo,.about-photo,.detail-image').forEach((element) => {
      gsap.from(element, {
        clipPath:'inset(6% 0 6% 0 round 16px)', duration:1.1, ease:'power3.out', clearProps:'clipPath',
        scrollTrigger:{ trigger:element, start:'top 94%', once:true },
      });
    });
    if (context.conditions.desktop) {
      const hero = document.querySelector('.marketing-hero');
      if (hero) {
        gsap.to('.chip-one',{y:-10,rotation:1,duration:2.5,repeat:-1,yoyo:true,ease:'sine.inOut'});
        gsap.to('.chip-two',{y:9,rotation:-1,duration:3,repeat:-1,yoyo:true,ease:'sine.inOut'});
        gsap.to('.growth-art',{y:28,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:1}});
      }
      gsap.utils.toArray('.about-photo img').forEach(img=>gsap.fromTo(img,{yPercent:-3,scale:1.06},{yPercent:3,scale:1.06,ease:'none',scrollTrigger:{trigger:img.parentElement,start:'top bottom',end:'bottom top',scrub:1}}));
    }
    const cta = document.querySelector('.cta-panel');
    if (cta) {
      gsap.from(cta.querySelectorAll('h2,p:not(.eyebrow),.sn-cluster'),{y:20,opacity:0,duration:.7,stagger:.12,ease:'power3.out',clearProps:'opacity,transform',scrollTrigger:{trigger:cta,start:'top 88%',once:true}});
    }
    gsap.utils.toArray('[data-counter]').forEach((element) => {
      const target = Number(element.dataset.counter);
      const precision = Number(element.dataset.counterPrecision || 0);
      const formatter = new Intl.NumberFormat(undefined, {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      });
      const value = { count:0 };
      gsap.to(value, {
        count:target, duration:1.5, ease:'power2.out',
        scrollTrigger:{ trigger:element, start:'top 95%', once:true },
        onUpdate:() => { element.textContent = formatter.format(value.count); },
      });
    });
    return () => {
      document.querySelectorAll('[data-counter]').forEach((element) => {
        const precision = Number(element.dataset.counterPrecision || 0);
        const formatter = new Intl.NumberFormat(undefined, {
          minimumFractionDigits: precision,
          maximumFractionDigits: precision,
        });
        element.textContent = formatter.format(Number(element.dataset.counter));
      });
    };
  });
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  return () => media.revert();
}
