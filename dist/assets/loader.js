// Dismiss the loader after the page styles and fonts are ready.
(() => {
  const loader = document.getElementById('page-loader');
  if (!loader) return;
  const ready = window.elvaronStylesReady || new Promise(resolve => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', resolve, { once: true });
  });
  ready.then(() => document.fonts ? document.fonts.ready : undefined).then(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      loader.classList.add('is-hidden');
      setTimeout(() => loader.remove(), 180);
    }));
  });
})();
