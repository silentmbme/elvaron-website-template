const copyButtons = document.querySelectorAll('[data-copy-code]');

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Fall back when the browser blocks clipboard access in a local preview.
    }
  }

  const field = document.createElement('textarea');
  field.value = value;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.append(field);
  field.select();

  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }
  field.remove();
  return copied;
}

copyButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const command = button.closest('.command-card')?.querySelector('pre code')?.textContent?.trim();
    if (!command) return;

    const label = button.querySelector('span');
    const copied = await copyText(command);
    button.classList.toggle('is-copied', copied);
    button.classList.toggle('is-error', !copied);
    button.setAttribute(
      'aria-label',
      copied ? 'Command copied to clipboard' : 'Unable to copy command',
    );
    if (label) label.textContent = copied ? 'Copied' : 'Select command';

    window.setTimeout(() => {
      button.classList.remove('is-copied', 'is-error');
      button.setAttribute('aria-label', `Copy ${command} command`);
      if (label) label.textContent = 'Copy';
    }, 1800);
  });
});

const guideNavLinks = [...document.querySelectorAll('.guide-rail nav a[href^="#"]')];
const guideSections = guideNavLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

function setActiveGuideLink() {
  const activationLine = window.innerHeight * 0.35;
  let activeSection = guideSections[0];

  for (const section of guideSections) {
    if (section.getBoundingClientRect().top <= activationLine) {
      activeSection = section;
    } else {
      break;
    }
  }

  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
    activeSection = guideSections.at(-1);
  }

  guideNavLinks.forEach((link) => {
    if (link.hash === `#${activeSection?.id}`) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

let guideScrollQueued = false;
window.addEventListener(
  'scroll',
  () => {
    if (guideScrollQueued) return;
    guideScrollQueued = true;
    window.requestAnimationFrame(() => {
      setActiveGuideLink();
      guideScrollQueued = false;
    });
  },
  { passive: true },
);
window.addEventListener('resize', setActiveGuideLink, { passive: true });
setActiveGuideLink();

const guideSidebar = document.querySelector('#guideSidebar');
const guideMenuToggle = document.querySelector('.guide-menu-toggle');
const guideMenuClose = document.querySelector('.guide-menu-close');
const guideMenuBackdrop = document.querySelector('.guide-menu-backdrop');
const compactGuideLayout = window.matchMedia('(max-width: 960px)');

function setGuideMenuOpen(isOpen, { restoreFocus = true } = {}) {
  if (!guideSidebar || !guideMenuToggle) return;

  guideSidebar.classList.toggle('is-open', isOpen);
  document.body.classList.toggle('guide-menu-open', isOpen);
  guideMenuToggle.setAttribute('aria-expanded', String(isOpen));
  guideMenuToggle.setAttribute(
    'aria-label',
    isOpen ? 'Close guide navigation' : 'Open guide navigation',
  );
  guideSidebar.inert = compactGuideLayout.matches && !isOpen;

  if (isOpen) {
    guideMenuClose?.focus();
  } else if (restoreFocus) {
    guideMenuToggle.focus();
  }
}

guideMenuToggle?.addEventListener('click', () => {
  setGuideMenuOpen(guideMenuToggle.getAttribute('aria-expanded') !== 'true');
});
guideMenuClose?.addEventListener('click', () => setGuideMenuOpen(false));
guideMenuBackdrop?.addEventListener('click', () => setGuideMenuOpen(false));
guideNavLinks.forEach((link) => {
  link.addEventListener('click', () => {
    if (compactGuideLayout.matches) {
      setGuideMenuOpen(false, { restoreFocus: false });
    }
  });
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && guideMenuToggle?.getAttribute('aria-expanded') === 'true') {
    setGuideMenuOpen(false);
  }
});
compactGuideLayout.addEventListener('change', (event) => {
  if (!event.matches) {
    guideSidebar?.classList.remove('is-open');
    guideSidebar.inert = false;
    document.body.classList.remove('guide-menu-open');
    guideMenuToggle?.setAttribute('aria-expanded', 'false');
  } else if (guideMenuToggle?.getAttribute('aria-expanded') !== 'true') {
    if (guideSidebar) guideSidebar.inert = true;
  }
});

if (compactGuideLayout.matches && guideSidebar) {
  guideSidebar.inert = true;
}
