const STORAGE_KEY = 'elvaron-appearance';
const DEFAULTS = { theme: 'light', direction: 'ltr', palette: 'lime', paletteMode: 'solid' };
const PALETTES = {
  lime: {
    primary: '#7ae6bf',
    start: '#a3f36b',
    end: '#69d7c8',
    gradient: 'linear-gradient(135deg, #a3f36b 0%, #69d7c8 100%)',
  },
  mint: {
    primary: '#96a8ff',
    start: '#c4a7ff',
    end: '#89a9ff',
    gradient: 'linear-gradient(135deg, #c4a7ff 0%, #89a9ff 100%)',
  },
  ocean: {
    primary: '#ffa576',
    start: '#ffd166',
    end: '#ff9c7a',
    gradient: 'linear-gradient(135deg, #ffd166 0%, #ff9c7a 100%)',
  },
  indigo: {
    primary: '#84c1fb',
    start: '#83e8eb',
    end: '#84b8ff',
    gradient: 'linear-gradient(135deg, #83e8eb 0%, #84b8ff 100%)',
  },
  sunset: {
    primary: '#cd9ff6',
    start: '#ff9cce',
    end: '#c3a0ff',
    gradient: 'linear-gradient(135deg, #ff9cce 0%, #c3a0ff 100%)',
  },
  rose: {
    primary: '#ffbf6e',
    start: '#ffe680',
    end: '#ffb86b',
    gradient: 'linear-gradient(135deg, #ffe680 0%, #ffb86b 100%)',
  },
};
const SOLID_PALETTES = {
  lime: '#35fe5d',
  blue: '#8ac7ee',
  violet: '#c6f24e',
  coral: '#ffb38a',
  rose: '#f09ac2',
  amber: '#f4ce70',
};

function readSettings() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const saved = stored
      ? JSON.parse(stored)
      : { theme: window.localStorage.getItem('elvaron-theme') };
    const paletteMode =
      saved.paletteMode === 'gradient' || saved.paletteMode === 'solid'
        ? saved.paletteMode
        : DEFAULTS.paletteMode;
    const paletteOptions = paletteMode === 'solid' ? SOLID_PALETTES : PALETTES;
    const legacyPalette =
      paletteMode === 'solid'
        ? Object.keys(SOLID_PALETTES).find((name) => SOLID_PALETTES[name] === saved.primary)
        : Object.keys(PALETTES).find((name) => PALETTES[name].primary === saved.primary);
    return {
      theme: saved.theme === 'dark' ? 'dark' : DEFAULTS.theme,
      direction: saved.direction === 'rtl' ? 'rtl' : DEFAULTS.direction,
      palette: Object.hasOwn(paletteOptions, saved.palette)
        ? saved.palette
        : legacyPalette || DEFAULTS.palette,
      paletteMode,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function initThemeToggle() {
  const toggles = [...document.querySelectorAll('[data-theme-toggle]')];
  const root = document.documentElement;
  const settings = readSettings();
  const drawer = document.querySelector('#site-customizer');
  const opener = document.querySelector('[data-customizer-open]');
  const closer = document.querySelector('[data-customizer-close]');
  const backdrop = document.querySelector('[data-customizer-backdrop]');
  const reset = document.querySelector('[data-customizer-reset]');

  const save = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Keep appearance controls usable when browser storage is unavailable.
    }
  };

  const render = () => {
    const isDark = settings.theme === 'dark';
    const palette =
      settings.paletteMode === 'solid'
        ? {
            primary: SOLID_PALETTES[settings.palette],
            start: SOLID_PALETTES[settings.palette],
            end: SOLID_PALETTES[settings.palette],
          }
        : PALETTES[settings.palette];
    const activePrimary = palette.primary;
    const activeBackground = palette.gradient || activePrimary;
    const channels = activePrimary
      .match(/[\da-f]{2}/gi)
      .map((channel) => Number.parseInt(channel, 16));
    const rgb = channels.join(', ');
    root.dataset.theme = settings.theme;
    root.dir = settings.direction;
    root.style.setProperty('--sn-primary', activePrimary);
    root.style.setProperty('--sn-primary-gradient-start', palette.start);
    root.style.setProperty('--sn-primary-gradient-end', palette.end);
    root.style.setProperty(
      '--sn-primary-01',
      `color-mix(in srgb, ${activePrimary} 30%, transparent)`,
    );
    root.style.setProperty(
      '--sn-primary-02',
      `color-mix(in srgb, ${activePrimary} 50%, transparent)`,
    );
    root.style.setProperty('--sn-primary-gradient', activeBackground);
    root.style.setProperty('--sn-accent', activePrimary);
    root.style.setProperty(
      '--sn-primary-hover',
      `color-mix(in srgb, ${activePrimary} 82%, #000 18%)`,
    );
    root.style.setProperty('--bs-primary', activePrimary);
    root.style.setProperty('--bs-primary-rgb', rgb);
    root.style.setProperty('--bs-secondary', 'var(--sn-secondary)');
    root.style.setProperty('--bs-link-color', 'var(--sn-secondary)');
    root.style.setProperty('--bs-link-hover-color', activePrimary);
    root.style.setProperty('--bs-link-color-rgb', rgb);
    root.style.setProperty('--bs-link-hover-color-rgb', rgb);
    document.body?.classList.toggle('theme-dark', isDark);

    toggles.forEach((button) => {
      const action = isDark ? 'Use light color theme' : 'Use dark color theme';
      button.setAttribute('aria-label', action);
      button.setAttribute('aria-pressed', String(isDark));
      button.title = action;
      const icon = button.querySelector('i');
      if (icon) {
        icon.classList.toggle('ri-sun-line', isDark);
        icon.classList.toggle('ri-moon-line', !isDark);
      }
    });

    document.querySelectorAll('[data-set-theme]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.setTheme === settings.theme));
    });
    document.querySelectorAll('[data-set-direction]').forEach((button) => {
      button.setAttribute(
        'aria-pressed',
        String(button.dataset.setDirection === settings.direction),
      );
    });
    document.querySelectorAll('[data-gradient-theme]').forEach((button) => {
      button.setAttribute(
        'aria-pressed',
        String(
          settings.paletteMode === 'gradient' && button.dataset.gradientTheme === settings.palette,
        ),
      );
    });
    document.querySelectorAll('[data-solid-theme]').forEach((button) => {
      button.setAttribute(
        'aria-pressed',
        String(settings.paletteMode === 'solid' && button.dataset.solidTheme === settings.palette),
      );
    });
  };

  const changeTheme = (theme) => {
    settings.theme = theme;
    render();
    save();
  };
  const onToggleTheme = () => changeTheme(settings.theme === 'dark' ? 'light' : 'dark');
  toggles.forEach((button) => button.addEventListener('click', onToggleTheme));

  const onReset = () => {
    Object.assign(settings, DEFAULTS);
    render();
    save();
  };

  const controlCleanups = [];
  const bindControls = (selector, createHandler) => {
    document.querySelectorAll(selector).forEach((button) => {
      const handler = createHandler(button);
      button.addEventListener('click', handler);
      controlCleanups.push(() => button.removeEventListener('click', handler));
    });
  };
  bindControls('[data-set-theme]', (button) => () => changeTheme(button.dataset.setTheme));
  bindControls('[data-set-direction]', (button) => () => {
    settings.direction = button.dataset.setDirection;
    render();
    save();
  });
  bindControls('[data-gradient-theme]', (button) => () => {
    settings.palette = button.dataset.gradientTheme;
    settings.paletteMode = 'gradient';
    render();
    save();
  });
  bindControls('[data-solid-theme]', (button) => () => {
    settings.palette = button.dataset.solidTheme;
    settings.paletteMode = 'solid';
    render();
    save();
  });

  const setDrawerOpen = (open) => {
    if (!drawer || !opener || !backdrop) return;
    if (open && drawer.hidden) {
      drawer.hidden = false;
      // Commit the closed position before starting the opening transition.
      void drawer.offsetWidth;
    }
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    drawer.inert = !open;
    opener.setAttribute('aria-expanded', String(open));
    backdrop.hidden = !open;
    document.body.classList.toggle('customizer-open', open);
    if (open) closer?.focus();
    else opener.focus();
  };
  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);
  const onKeydown = (event) => {
    if (event.key === 'Escape' && drawer?.classList.contains('is-open')) closeDrawer();
    if (event.key === 'Tab' && drawer?.classList.contains('is-open')) {
      const focusable = [...drawer.querySelectorAll('button:not(:disabled)')];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  };

  opener?.addEventListener('click', openDrawer);
  closer?.addEventListener('click', closeDrawer);
  backdrop?.addEventListener('click', closeDrawer);
  reset?.addEventListener('click', onReset);
  document.addEventListener('keydown', onKeydown);
  render();

  return () => {
    toggles.forEach((button) => button.removeEventListener('click', onToggleTheme));
    controlCleanups.forEach((cleanup) => cleanup());
    opener?.removeEventListener('click', openDrawer);
    closer?.removeEventListener('click', closeDrawer);
    backdrop?.removeEventListener('click', closeDrawer);
    reset?.removeEventListener('click', onReset);
    document.removeEventListener('keydown', onKeydown);
  };
}
