export function initTeamSocial() {
  const wrappers = [...document.querySelectorAll('.growth-alt-team-social-wrap')];
  if (!wrappers.length) return () => {};

  const close = (wrapper) => {
    wrapper.classList.remove('is-open');
    wrapper.querySelector('.growth-alt-team-share')?.setAttribute('aria-expanded', 'false');
  };
  const onToggle = (event) => {
    const button = event.currentTarget;
    const wrapper = button.closest('.growth-alt-team-social-wrap');
    const open = !wrapper.classList.contains('is-open');
    wrappers.forEach(close);
    if (open) {
      wrapper.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
    }
  };
  const onDocumentClick = (event) => {
    wrappers.forEach((wrapper) => {
      if (!wrapper.contains(event.target)) close(wrapper);
    });
  };
  const onKeydown = (event) => {
    if (event.key === 'Escape') wrappers.forEach(close);
  };

  const buttons = wrappers.map((wrapper) => wrapper.querySelector('.growth-alt-team-share')).filter(Boolean);
  buttons.forEach((button) => button.addEventListener('click', onToggle));
  document.addEventListener('click', onDocumentClick);
  document.addEventListener('keydown', onKeydown);

  return () => {
    buttons.forEach((button) => button.removeEventListener('click', onToggle));
    document.removeEventListener('click', onDocumentClick);
    document.removeEventListener('keydown', onKeydown);
  };
}
