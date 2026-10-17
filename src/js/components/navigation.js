import Offcanvas from 'bootstrap/js/dist/offcanvas';
import Dropdown from 'bootstrap/js/dist/dropdown';
import 'bootstrap/js/dist/collapse';
import 'bootstrap/js/dist/carousel';
import 'bootstrap/js/dist/dropdown';

export function initNavigation() {
  const header = document.querySelector('.site-header');
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 20);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive:true });
  const menu = document.querySelector('#mainNav');
  const menuToggles = document.querySelectorAll('[data-bs-target="#mainNav"]');
  const desktop = window.matchMedia('(min-width: 1200px)');
  menu?.addEventListener('show.bs.offcanvas', () => {
    menu.hidden = false;
    header?.classList.add('is-offcanvas-open');
    menuToggles.forEach(toggle => toggle.setAttribute('aria-expanded', 'true'));
  });
  menu?.addEventListener('hidden.bs.offcanvas', () => {
    menu.hidden = true;
    header?.classList.remove('is-offcanvas-open');
    menuToggles.forEach(toggle => toggle.setAttribute('aria-expanded', 'false'));
  });

  // Keep the current page visible in the shared navigation on every route.
  const currentPath = window.location.pathname.replace(/\/$/, '/index.html');
  header?.querySelectorAll('.navbar-nav a[href]').forEach((link) => {
    const linkPath = new URL(link.href, window.location.href).pathname.replace(/\/$/, '/index.html');
    if (linkPath !== currentPath) return;
    link.classList.add('active');
    link.setAttribute('aria-current', 'page');
    link.closest('.dropdown')?.querySelector('.dropdown-toggle')?.classList.add('active');
  });

  // Keep a mobile submenu open when it contains the current page.
  header?.querySelectorAll('.mobile-subnav').forEach((submenu) => {
    if (!submenu.querySelector('[aria-current="page"]')) return;
    submenu.classList.add('show');
    const toggle = header.querySelector(`[data-bs-target="#${submenu.id}"]`);
    toggle?.setAttribute('aria-expanded', 'true');
    toggle?.classList.add('active');
  });

  // Desktop dropdowns open on hover, with Bootstrap still handling click and keyboard use.
  const desktopNavigation = header?.querySelector('.desktop-navigation');
  const desktopDropdowns = desktopNavigation?.querySelectorAll('.dropdown') ?? [];
  const closeDesktopDropdowns = () => {
    if (!desktop.matches) return;
    desktopDropdowns.forEach((dropdown) => {
      const toggle = dropdown.querySelector('.dropdown-toggle');
      if (toggle) Dropdown.getOrCreateInstance(toggle).hide();
    });
  };

  desktopDropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    if (!toggle) return;
    let closeTimer;
    dropdown.addEventListener('mouseenter', () => {
      if (!desktop.matches) return;
      window.clearTimeout(closeTimer);
      Dropdown.getOrCreateInstance(toggle).show();
    });
    dropdown.addEventListener('mouseleave', () => {
      if (!desktop.matches) return;
      closeTimer = window.setTimeout(() => Dropdown.getOrCreateInstance(toggle).hide(), 120);
    });
  });
  // Close hover-open menus after the pointer leaves the whole nav or browser page.
  desktopNavigation?.addEventListener('mouseleave', closeDesktopDropdowns);
  document.documentElement.addEventListener('mouseleave', closeDesktopDropdowns);

  menu?.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (!menu.classList.contains('show')) return;
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      menu.addEventListener('hidden.bs.offcanvas', () => {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll:true });
        target.scrollIntoView({ behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
        history.replaceState(null, '', link.getAttribute('href'));
      }, { once:true });
      Offcanvas.getOrCreateInstance(menu).hide();
    });
  });
  // Remove the mobile backdrop and scroll lock when resizing to desktop.
  desktop.addEventListener('change', ({ matches }) => {
    if (matches && menu) Offcanvas.getInstance(menu)?.hide();
  });

  // Avoid animating the closed drawer when its styles first attach on page load.
  window.requestAnimationFrame(() => header?.classList.add('offcanvas-ready'));
}
